package com.rapidresponse.resource.controller;

import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.request.ReliefItemRequest;
import com.rapidresponse.resource.dto.response.*;
import com.rapidresponse.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resource Allocation", description = "Helicopter relief-item packing (0-1 knapsack)")
public class ResourceController {

    private final ResourceService resourceService;

    @Operation(summary = "Run Branch & Bound (exact) packing for a helicopter")
    @PostMapping("/allocate/exact")
    public ResponseEntity<AllocationResultResponse> allocateExact(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(resourceService.allocateExact(request));
    }

    @Operation(summary = "Run Greedy heuristic packing for a helicopter")
    @PostMapping("/allocate/heuristic")
    public ResponseEntity<AllocationResultResponse> allocateHeuristic(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(resourceService.allocateHeuristic(request));
    }

    @Operation(summary = "Run both algorithms and return a side-by-side comparison")
    @PostMapping("/allocate/compare")
    public ResponseEntity<AllocationCompareResponse> allocateCompare(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(resourceService.compareAllocations(request));
    }

    @Operation(summary = "List all available relief items")
    @GetMapping("/items")
    public ResponseEntity<List<ReliefItemResponse>> listItems() {
        return ResponseEntity.ok(resourceService.listItems());
    }

    @Operation(summary = "Add a new relief item to inventory")
    @PostMapping("/items")
    public ResponseEntity<ReliefItemResponse> addItem(@Valid @RequestBody ReliefItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.addItem(request));
    }

    @Operation(summary = "List all helicopters and their payload capacities")
    @GetMapping("/helicopters")
    public ResponseEntity<List<HelicopterResponse>> listHelicopters() {
        return ResponseEntity.ok(resourceService.listHelicopters());
    }
}
