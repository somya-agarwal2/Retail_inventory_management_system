package com.rims.returns;

import com.rims.common.exception.ResourceNotFoundException;
import com.rims.inventory.InventoryService;
import com.rims.inventory.StockInRequest;
import com.rims.order.Customer;
import com.rims.order.CustomerOrder;
import com.rims.order.CustomerOrderRepository;
import com.rims.order.CustomerRepository;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<ReturnDto> getReturns(Long orderId, String status, Pageable pageable) {
        return returnRepository.findFilteredReturns(orderId, status, pageable)
                .map(ReturnDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public ReturnDto getReturnById(Long id) {
        ReturnOrder ro = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));
        return ReturnDto.fromEntity(ro);
    }

    @Transactional
    public ReturnDto createReturn(ReturnDto.CreateReturnRequest request, Long userId) {
        CustomerOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        String rmaNumber = "RMA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ReturnOrder returnOrder = ReturnOrder.builder()
                .returnNumber(rmaNumber)
                .order(order)
                .customer(customer)
                .returnReason(request.getReturnReason())
                .overallCondition(request.getOverallCondition())
                .status("REQUESTED")
                .refundAmount(BigDecimal.ZERO)
                .processedBy(userId)
                .items(new ArrayList<>())
                .build();

        BigDecimal refundTotal = BigDecimal.ZERO;

        for (ReturnDto.ReturnItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            BigDecimal lineRefund = product.getSellingPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            refundTotal = refundTotal.add(lineRefund);

            ReturnItem item = ReturnItem.builder()
                    .returnOrder(returnOrder)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .conditionStatus(itemDto.getConditionStatus() != null ? itemDto.getConditionStatus() : request.getOverallCondition())
                    .restocked(false)
                    .inspectionNotes(itemDto.getInspectionNotes())
                    .build();

            returnOrder.getItems().add(item);
        }

        returnOrder.setRefundAmount(refundTotal);
        return ReturnDto.fromEntity(returnRepository.save(returnOrder));
    }

    @Transactional
    public ReturnDto inspectAndReceive(Long id, String condition, Long userId) {
        ReturnOrder returnOrder = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));

        CustomerOrder order = returnOrder.getOrder();

        for (ReturnItem item : returnOrder.getItems()) {
            item.setConditionStatus(condition != null ? condition : returnOrder.getOverallCondition());

            // If item is SELLABLE, restock into fulfillment inventory
            if ("SELLABLE".equalsIgnoreCase(item.getConditionStatus())) {
                StockInRequest stockIn = StockInRequest.builder()
                        .productId(item.getProduct().getId())
                        .locationType(order.getFulfillmentLocationType())
                        .locationId(order.getFulfillmentLocationId())
                        .quantity(item.getQuantity())
                        .unitCost(item.getProduct().getPurchasePrice())
                        .referenceType("RETURN_RMA")
                        .referenceId(returnOrder.getReturnNumber())
                        .notes("Restocked sellable returned merchandise")
                        .build();

                inventoryService.stockIn(stockIn, userId);
                item.setRestocked(true);
            } else {
                item.setRestocked(false);
                item.setInspectionNotes("Damaged or defective item written off to loss account");
            }
        }

        returnOrder.setStatus("RECEIVED");
        returnOrder.setProcessedBy(userId);
        return ReturnDto.fromEntity(returnRepository.save(returnOrder));
    }

    @Transactional
    public ReturnDto refundReturn(Long id) {
        ReturnOrder returnOrder = returnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));

        returnOrder.setStatus("REFUNDED");
        return ReturnDto.fromEntity(returnRepository.save(returnOrder));
    }
}
