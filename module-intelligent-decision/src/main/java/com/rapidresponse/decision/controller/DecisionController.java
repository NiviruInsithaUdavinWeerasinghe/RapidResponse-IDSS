package com.rapidresponse.decision.controller;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.dto.request.DecisionRequest;
import com.rapidresponse.decision.dto.response.DecisionCompareResponse;
import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.decision.dto.response.SOSRequestResponse;
import com.rapidresponse.decision.service.DecisionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for Module 4 – Intelligent Decision Support Module.
 * Exposes endpoints for exact optimization (Branch & Bound), heuristic optimization (Weighted Scoring),
 * side-by-side comparisons, SOS request management, and benchmark data generation.
 */
@RestController
@RequestMapping("/api/v1/decisions")
@Tag(name = "Intelligent Decision Support", description = "MCDA Emergency SOS Batch Selection (Branch & Bound and Weighted Scoring)")
public class DecisionController {

    private final DecisionService decisionService;

    public DecisionController(DecisionService decisionService) {
        this.decisionService = decisionService;
    }

    @Operation(summary = "Run Branch & Bound exact solver to find optimal SOS batch")
    @PostMapping(value = {"/optimize/exact", "/exact"})
    public ResponseEntity<DecisionResultResponse> optimizeExact(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(decisionService.optimizeExact(request));
    }

    @Operation(summary = "Run Weighted Scoring heuristic solver for rapid approximate selection")
    @PostMapping(value = {"/optimize/heuristic", "/heuristic"})
    public ResponseEntity<DecisionResultResponse> optimizeHeuristic(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(decisionService.optimizeHeuristic(request));
    }

    @Operation(summary = "Run both exact and heuristic algorithms and return a side-by-side performance comparison")
    @PostMapping(value = {"/optimize/compare", "/compare"})
    public ResponseEntity<DecisionCompareResponse> optimizeCompare(@Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(decisionService.optimizeCompare(request));
    }

    @Operation(summary = "List all pending emergency SOS rescue requests")
    @GetMapping("/sos-requests")
    public ResponseEntity<List<SOSRequestResponse>> listPendingRequests() {
        return ResponseEntity.ok(decisionService.listPendingRequests());
    }

    @Operation(summary = "List all emergency SOS requests in the system")
    @GetMapping("/sos-requests/all")
    public ResponseEntity<List<SOSRequestResponse>> listAllRequests() {
        return ResponseEntity.ok(decisionService.listAllRequests());
    }

    @Operation(summary = "Submit a new emergency SOS rescue request from a camp")
    @PostMapping("/sos-requests")
    public ResponseEntity<SOSRequestResponse> submitRequest(@Valid @RequestBody CreateSOSRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(decisionService.submitRequest(request));
    }

    @Operation(summary = "Approve a specific SOS request for immediate rescue dispatch")
    @PatchMapping("/sos-requests/{id}/approve")
    public ResponseEntity<SOSRequestResponse> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(decisionService.approveRequest(id));
    }

    @Operation(summary = "Seed synthetic sample SOS requests for testing and benchmarks")
    @PostMapping("/sample-data")
    public ResponseEntity<List<SOSRequestResponse>> seedSampleData(@RequestParam(defaultValue = "15") int count) {
        return ResponseEntity.ok(decisionService.seedSampleRequests(count));
    }
}
