package com.rims.order;

import com.rims.common.exception.InvalidOperationException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.inventory.InventoryService;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrders(Long customerId, String locationType, Long locationId, String status, Pageable pageable) {
        return orderRepository.findFilteredOrders(customerId, locationType, locationId, status, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToDto(order);
    }

    @Transactional
    public OrderDto createOrder(OrderDto.CreateOrderRequest request, Long userId) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        String orderNum = "ORD-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(orderNum)
                .customer(customer)
                .fulfillmentLocationType(request.getFulfillmentLocationType())
                .fulfillmentLocationId(request.getFulfillmentLocationId())
                .status("PENDING")
                .paymentStatus("PAID")
                .shippingCarrier(request.getShippingCarrier() != null ? request.getShippingCarrier() : "BlueDart Express")
                .orderDate(Instant.now())
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderDto.OrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            // Two-phase reservation: reserve available stock at fulfillment location
            inventoryService.reserveStock(product.getId(), order.getFulfillmentLocationType(), order.getFulfillmentLocationId(), itemDto.getQuantity());

            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(unitPrice)
                    .allocatedQty(itemDto.getQuantity())
                    .fulfilledQty(0)
                    .build();

            order.getItems().add(item);
        }

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = BigDecimal.valueOf(150.00);
        BigDecimal total = subtotal.add(tax).add(shipping);

        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setShippingCost(shipping);
        order.setTotalAmount(total);

        // Record initial status history
        order.getStatusHistory().add(OrderStatusHistory.builder()
                .order(order)
                .previousStatus(null)
                .newStatus("PENDING")
                .comment("Order placed and stock reserved")
                .changedBy(userId)
                .build());

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto updateStatus(Long id, String newStatus, String comment, Long userId) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        String oldStatus = order.getStatus();

        if ("SHIPPED".equalsIgnoreCase(newStatus)) {
            return shipOrder(id, userId);
        } else if ("CANCELLED".equalsIgnoreCase(newStatus)) {
            return cancelOrder(id, comment, userId);
        } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            order.setStatus("DELIVERED");
            order.setDeliveredDate(Instant.now());
        } else {
            order.setStatus(newStatus.toUpperCase());
        }

        order.getStatusHistory().add(OrderStatusHistory.builder()
                .order(order)
                .previousStatus(oldStatus)
                .newStatus(order.getStatus())
                .comment(comment != null ? comment : "Status updated to " + order.getStatus())
                .changedBy(userId)
                .build());

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto shipOrder(Long id, Long userId) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if ("SHIPPED".equalsIgnoreCase(order.getStatus()) || "DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new InvalidOperationException("Order has already shipped");
        }

        // Fulfill physical inventory and reserved balances
        for (OrderItem item : order.getItems()) {
            inventoryService.fulfillReservedStock(
                    item.getProduct().getId(),
                    order.getFulfillmentLocationType(),
                    order.getFulfillmentLocationId(),
                    item.getQuantity(),
                    order.getOrderNumber(),
                    userId);
            item.setFulfilledQty(item.getQuantity());
        }

        String tracking = "BD-EXP-" + (int)(Math.random() * 900000 + 100000);
        order.setTrackingNumber(tracking);
        order.setStatus("SHIPPED");
        order.setShippedDate(Instant.now());

        order.getStatusHistory().add(OrderStatusHistory.builder()
                .order(order)
                .previousStatus("PACKED")
                .newStatus("SHIPPED")
                .comment("Dispatched via " + order.getShippingCarrier() + ", Tracking: " + tracking)
                .changedBy(userId)
                .build());

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDto cancelOrder(Long id, String reason, Long userId) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if ("SHIPPED".equalsIgnoreCase(order.getStatus()) || "DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new InvalidOperationException("Cannot cancel order once it has been shipped or delivered");
        }

        // Release reserved stock back to available pool
        for (OrderItem item : order.getItems()) {
            inventoryService.releaseReservedStock(
                    item.getProduct().getId(),
                    order.getFulfillmentLocationType(),
                    order.getFulfillmentLocationId(),
                    item.getQuantity());
        }

        String prev = order.getStatus();
        order.setStatus("CANCELLED");

        order.getStatusHistory().add(OrderStatusHistory.builder()
                .order(order)
                .previousStatus(prev)
                .newStatus("CANCELLED")
                .comment(reason != null ? reason : "Order cancelled by customer. Reserved stock released.")
                .changedBy(userId)
                .build());

        return mapToDto(orderRepository.save(order));
    }

    private OrderDto mapToDto(CustomerOrder order) {
        String locName = inventoryService.resolveLocationName(order.getFulfillmentLocationType(), order.getFulfillmentLocationId());
        return OrderDto.fromEntity(order, locName);
    }
}
