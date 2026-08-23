package com.rapidresponse.allocation.service;

import com.rapidresponse.allocation.dto.request.ResourceRequest;
import com.rapidresponse.allocation.dto.response.ResourceResponse;
import com.rapidresponse.allocation.entity.ResourceEntity;
import com.rapidresponse.allocation.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponse addResource(ResourceRequest request) {
        ResourceEntity entity = ResourceEntity.builder()
                .name(request.name())
                .weight(request.weight())
                .value(request.value())
                .category(request.category())
                .build();

        ResourceEntity saved = resourceRepository.save(entity);
        return toResponse(saved);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceResponse getResource(Long id) {
        ResourceEntity entity = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Resource not found with id: " + id));
        return toResponse(entity);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    public void clearAll() {
        resourceRepository.deleteAll();
    }

    private ResourceResponse toResponse(ResourceEntity entity) {
        return new ResourceResponse(
                entity.getId(),
                entity.getName(),
                entity.getWeight(),
                entity.getValue(),
                entity.getCategory()
        );
    }
}
