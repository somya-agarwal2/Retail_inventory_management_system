package com.rims.transfer;

import com.rims.common.exception.InvalidOperationException;
import com.rims.common.exception.ResourceNotFoundException;
import com.rims.inventory.InventoryService;
import com.rims.inventory.StockInRequest;
import com.rims.inventory.StockOutRequest;
import com.rims.product.Product;
import com.rims.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final StockTransferRepository stockTransferRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public Page<TransferDto> getTransfers(String status, String sourceType, Long sourceId, String destType, Long destId, Pageable pageable) {
        return stockTransferRepository.findFilteredTransfers(status, sourceType, sourceId, destType, destId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public TransferDto getTransferById(Long id) {
        StockTransfer st = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));
        return mapToDto(st);
    }

    @Transactional
    public TransferDto createTransfer(TransferDto.CreateTransferRequest request, Long userId) {
        String trfNumber = "TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        StockTransfer transfer = StockTransfer.builder()
                .transferNumber(trfNumber)
                .sourceType(request.getSourceType())
                .sourceId(request.getSourceId())
                .destinationType(request.getDestinationType())
                .destinationId(request.getDestinationId())
                .status("PENDING")
                .initiatedBy(userId)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        for (TransferDto.TransferItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            StockTransferItem item = StockTransferItem.builder()
                    .transfer(transfer)
                    .product(product)
                    .requestedQty(itemDto.getRequestedQty())
                    .shippedQty(0)
                    .receivedQty(0)
                    .notes(itemDto.getNotes())
                    .build();

            transfer.getItems().add(item);
        }

        return mapToDto(stockTransferRepository.save(transfer));
    }

    @Transactional
    public TransferDto approveTransfer(Long id, Long userId) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        if (!"PENDING".equalsIgnoreCase(transfer.getStatus())) {
            throw new InvalidOperationException("Only PENDING transfers can be approved. Current status: " + transfer.getStatus());
        }

        transfer.setStatus("APPROVED");
        transfer.setApprovedBy(userId);
        return mapToDto(stockTransferRepository.save(transfer));
    }

    @Transactional
    public TransferDto dispatchTransfer(Long id, Long userId) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        if (!"APPROVED".equalsIgnoreCase(transfer.getStatus()) && !"PENDING".equalsIgnoreCase(transfer.getStatus())) {
            throw new InvalidOperationException("Transfer cannot be dispatched from status: " + transfer.getStatus());
        }

        // Deduct items from source location
        for (StockTransferItem item : transfer.getItems()) {
            StockOutRequest stockOut = StockOutRequest.builder()
                    .productId(item.getProduct().getId())
                    .locationType(transfer.getSourceType())
                    .locationId(transfer.getSourceId())
                    .quantity(item.getRequestedQty())
                    .reason("STOCK_TRANSFER_OUT")
                    .notes("Dispatched for Transfer " + transfer.getTransferNumber())
                    .build();

            inventoryService.stockOut(stockOut, userId);
            item.setShippedQty(item.getRequestedQty());
        }

        transfer.setStatus("IN_TRANSIT");
        transfer.setDepartureTime(Instant.now());
        return mapToDto(stockTransferRepository.save(transfer));
    }

    @Transactional
    public TransferDto receiveTransfer(Long id, Long userId) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        if (!"IN_TRANSIT".equalsIgnoreCase(transfer.getStatus())) {
            throw new InvalidOperationException("Only IN_TRANSIT transfers can be received. Current status: " + transfer.getStatus());
        }

        // Increment items in destination location
        for (StockTransferItem item : transfer.getItems()) {
            StockInRequest stockIn = StockInRequest.builder()
                    .productId(item.getProduct().getId())
                    .locationType(transfer.getDestinationType())
                    .locationId(transfer.getDestinationId())
                    .quantity(item.getShippedQty())
                    .unitCost(item.getProduct().getPurchasePrice())
                    .referenceType("STOCK_TRANSFER")
                    .referenceId(transfer.getTransferNumber())
                    .notes("Received from Transfer " + transfer.getTransferNumber())
                    .build();

            inventoryService.stockIn(stockIn, userId);
            item.setReceivedQty(item.getShippedQty());
        }

        transfer.setStatus("COMPLETED");
        transfer.setArrivalTime(Instant.now());
        transfer.setReceivedBy(userId);
        return mapToDto(stockTransferRepository.save(transfer));
    }

    @Transactional
    public TransferDto cancelTransfer(Long id, Long userId) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        if ("IN_TRANSIT".equalsIgnoreCase(transfer.getStatus()) || "COMPLETED".equalsIgnoreCase(transfer.getStatus())) {
            throw new InvalidOperationException("Cannot cancel transfer in state: " + transfer.getStatus());
        }

        transfer.setStatus("CANCELLED");
        return mapToDto(stockTransferRepository.save(transfer));
    }

    private TransferDto mapToDto(StockTransfer st) {
        String srcName = inventoryService.resolveLocationName(st.getSourceType(), st.getSourceId());
        String destName = inventoryService.resolveLocationName(st.getDestinationType(), st.getDestinationId());
        return TransferDto.fromEntity(st, srcName, destName);
    }
}
