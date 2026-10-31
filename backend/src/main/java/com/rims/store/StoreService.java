package com.rims.store;

import com.rims.common.exception.DuplicateResourceException;
import com.rims.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public List<StoreDto> getAllStores() {
        return storeRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(StoreDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreDto getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        return StoreDto.fromEntity(store);
    }

    @Transactional
    public StoreDto createStore(StoreDto dto) {
        if (storeRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Store code '" + dto.getCode() + "' already exists");
        }

        Store store = Store.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .address(dto.getAddress().trim())
                .city(dto.getCity().trim())
                .state(dto.getState().trim())
                .postalCode(dto.getPostalCode().trim())
                .storeManager(dto.getStoreManager())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .active(dto.isActive())
                .build();

        return StoreDto.fromEntity(storeRepository.save(store));
    }

    @Transactional
    public StoreDto updateStore(Long id, StoreDto dto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));

        if (!store.getCode().equalsIgnoreCase(dto.getCode()) && storeRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Store code '" + dto.getCode() + "' is already in use");
        }

        store.setCode(dto.getCode().toUpperCase().trim());
        store.setName(dto.getName().trim());
        store.setAddress(dto.getAddress().trim());
        store.setCity(dto.getCity().trim());
        store.setState(dto.getState().trim());
        store.setPostalCode(dto.getPostalCode().trim());
        store.setStoreManager(dto.getStoreManager());
        store.setPhone(dto.getPhone());
        store.setEmail(dto.getEmail());
        store.setActive(dto.isActive());

        return StoreDto.fromEntity(storeRepository.save(store));
    }

    @Transactional
    public void deleteStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        store.setActive(false);
        storeRepository.save(store);
    }
}
