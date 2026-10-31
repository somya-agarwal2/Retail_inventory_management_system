package com.rims.supplier;

import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public Page<SupplierDto> getSuppliers(String search, String status, Pageable pageable) {
        return supplierRepository.searchSuppliers(search, status, pageable)
                .map(SupplierDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return SupplierDto.fromEntity(s);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        if (supplierRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Supplier code '" + dto.getCode() + "' already exists");
        }

        Supplier s = Supplier.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .contactPerson(dto.getContactPerson().trim())
                .email(dto.getEmail().trim())
                .phone(dto.getPhone().trim())
                .address(dto.getAddress().trim())
                .city(dto.getCity().trim())
                .state(dto.getState().trim())
                .taxId(dto.getTaxId())
                .paymentTerms(dto.getPaymentTerms() != null ? dto.getPaymentTerms() : "NET_30")
                .rating(dto.getRating() != null ? dto.getRating() : java.math.BigDecimal.valueOf(5.00))
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        return SupplierDto.fromEntity(supplierRepository.save(s));
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        if (!s.getCode().equalsIgnoreCase(dto.getCode()) && supplierRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Supplier code '" + dto.getCode() + "' is already in use");
        }

        s.setCode(dto.getCode().toUpperCase().trim());
        s.setName(dto.getName().trim());
        s.setContactPerson(dto.getContactPerson().trim());
        s.setEmail(dto.getEmail().trim());
        s.setPhone(dto.getPhone().trim());
        s.setAddress(dto.getAddress().trim());
        s.setCity(dto.getCity().trim());
        s.setState(dto.getState().trim());
        s.setTaxId(dto.getTaxId());
        if (dto.getPaymentTerms() != null) s.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getRating() != null) s.setRating(dto.getRating());
        if (dto.getStatus() != null) s.setStatus(dto.getStatus());

        return SupplierDto.fromEntity(supplierRepository.save(s));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        s.setStatus("INACTIVE");
        supplierRepository.save(s);
    }
}
