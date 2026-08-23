package com.rapidresponse.allocation.controller;

import com.rapidresponse.allocation.dto.request.ResourceRequest;
import com.rapidresponse.allocation.dto.response.ResourceResponse;
import com.rapidresponse.allocation.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceResponse> addResource(@Valid @RequestBody ResourceRequest request) {
        ResourceResponse response = resourceService.addResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAllResources() {
        resourceService.clearAll();
        return ResponseEntity.noContent().build();
    }
}
