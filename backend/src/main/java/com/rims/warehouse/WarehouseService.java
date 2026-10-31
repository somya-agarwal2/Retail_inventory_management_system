package com.rims.warehouse;

import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(WarehouseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return WarehouseDto.fromEntity(warehouse);
    }

    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto dto) {
        if (warehouseRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Warehouse code '" + dto.getCode() + "' already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .address(dto.getAddress().trim())
                .city(dto.getCity().trim())
                .state(dto.getState().trim())
                .postalCode(dto.getPostalCode().trim())
                .contactPerson(dto.getContactPerson())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .capacitySqft(dto.getCapacitySqft())
                .active(dto.isActive())
                .build();

        return WarehouseDto.fromEntity(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseDto updateWarehouse(Long id, WarehouseDto dto) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        if (!warehouse.getCode().equalsIgnoreCase(dto.getCode()) && warehouseRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Warehouse code '" + dto.getCode() + "' is already in use");
        }

        warehouse.setCode(dto.getCode().toUpperCase().trim());
        warehouse.setName(dto.getName().trim());
        warehouse.setAddress(dto.getAddress().trim());
        warehouse.setCity(dto.getCity().trim());
        warehouse.setState(dto.getState().trim());
        warehouse.setPostalCode(dto.getPostalCode().trim());
        warehouse.setContactPerson(dto.getContactPerson());
        warehouse.setPhone(dto.getPhone());
        warehouse.setEmail(dto.getEmail());
        warehouse.setCapacitySqft(dto.getCapacitySqft());
        warehouse.setActive(dto.isActive());

        return WarehouseDto.fromEntity(warehouseRepository.save(warehouse));
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
    }
}
