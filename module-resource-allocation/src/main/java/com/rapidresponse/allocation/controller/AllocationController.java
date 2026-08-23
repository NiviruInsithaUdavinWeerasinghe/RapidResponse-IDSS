package com.rapidresponse.allocation.controller;

import com.rapidresponse.allocation.dto.request.AllocationRequest;
import com.rapidresponse.allocation.dto.response.AllocationResponse;
import com.rapidresponse.allocation.service.AllocationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocation")
@RequiredArgsConstructor
@Validated
public class AllocationController {

    private final AllocationService allocationService;

    @PostMapping
    public ResponseEntity<AllocationResponse> allocate(@Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(allocationService.allocate(request));
    }

    @GetMapping("/compare")
    public ResponseEntity<List<AllocationResponse>> compareAlgorithms(
            @RequestParam @Positive double capacity) {
        return ResponseEntity.ok(allocationService.compareAlgorithms(capacity));
    }
}
