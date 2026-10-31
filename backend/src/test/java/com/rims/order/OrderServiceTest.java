package com.rims.order;

import com.rims.common.exception.InvalidOperationException;
import com.rims.inventory.InventoryService;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CustomerOrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;

    private Customer testCustomer;
    private Product testProduct;
    private CustomerOrder testOrder;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .id(1L)
                .customerCode("CUST-1001")
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .build();

        testProduct = Product.builder()
                .id(5L)
                .sku("APP-DENIM-001")
                .name("Slim Fit Denim Jeans")
                .sellingPrice(new BigDecimal("59.99"))
                .purchasePrice(new BigDecimal("28.00"))
                .build();

        OrderItem item = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .allocatedQty(2)
                .fulfilledQty(0)
                .unitPrice(new BigDecimal("59.99"))
                .build();

        List<OrderItem> items = new ArrayList<>();
        items.add(item);

        testOrder = CustomerOrder.builder()
                .id(10L)
                .orderNumber("ORD-2026-TEST01")
                .customer(testCustomer)
                .fulfillmentLocationType("WAREHOUSE")
                .fulfillmentLocationId(1L)
                .status("PENDING")
                .paymentStatus("PAID")
                .shippingCarrier("BlueDart Express")
                .orderDate(Instant.now())
                .items(items)
                .statusHistory(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Scenario 1: Create order reserves stock and sets initial PENDING status")
    void testCreateOrder_Success() {
        OrderDto.CreateOrderRequest request = OrderDto.CreateOrderRequest.builder()
                .customerId(1L)
                .fulfillmentLocationType("WAREHOUSE")
                .fulfillmentLocationId(1L)
                .shippingCarrier("BlueDart Express")
                .items(Collections.singletonList(
                        OrderDto.OrderItemDto.builder()
                                .productId(5L)
                                .quantity(2)
                                .build()
                ))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(productRepository.findById(5L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(CustomerOrder.class))).thenAnswer(i -> i.getArgument(0));
        when(inventoryService.resolveLocationName("WAREHOUSE", 1L)).thenReturn("Central Distribution Hub");

        OrderDto created = orderService.createOrder(request, 99L);

        assertNotNull(created);
        assertEquals("PENDING", created.getStatus());
        // Verify stock reservation was triggered
        verify(inventoryService, times(1)).reserveStock(5L, "WAREHOUSE", 1L, 2);
        verify(orderRepository, times(1)).save(any(CustomerOrder.class));
    }

    @Test
    @DisplayName("Scenario 2: Cancel order releases reserved stock back to inventory pool")
    void testCancelOrder_ReleasesReservedStock() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(CustomerOrder.class))).thenAnswer(i -> i.getArgument(0));
        when(inventoryService.resolveLocationName(any(), any())).thenReturn("Central Distribution Hub");

        OrderDto cancelled = orderService.cancelOrder(10L, "Customer requested cancellation", 99L);

        assertNotNull(cancelled);
        assertEquals("CANCELLED", cancelled.getStatus());
        // Verify inventory reservation was released
        verify(inventoryService, times(1)).releaseReservedStock(5L, "WAREHOUSE", 1L, 2);
    }

    @Test
    @DisplayName("Scenario 3: Reject cancellation if order is already shipped or delivered")
    void testCancelOrder_AlreadyShipped() {
        testOrder.setStatus("SHIPPED");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(testOrder));

        InvalidOperationException exception = assertThrows(InvalidOperationException.class, () -> {
            orderService.cancelOrder(10L, "Late cancel", 99L);
        });

        assertTrue(exception.getMessage().contains("Cannot cancel order once it has been shipped or delivered"));
        verify(inventoryService, never()).releaseReservedStock(any(), any(), any(), anyInt());
    }
}
