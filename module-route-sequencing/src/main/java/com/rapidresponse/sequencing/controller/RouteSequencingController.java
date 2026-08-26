package com.rapidresponse.sequencing.controller;

import com.rapidresponse.sequencing.dto.ComparisonResponse;
import com.rapidresponse.sequencing.dto.SequencingRequest;
import com.rapidresponse.sequencing.dto.SequencingResponse;
import com.rapidresponse.sequencing.service.RouteSequencingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sequencing")
@Tag(name = "Route Sequencing", description = "Travelling Salesman Route Sequencing and Optimization")
public class RouteSequencingController {

    private final RouteSequencingService sequencingService;

    public RouteSequencingController(RouteSequencingService sequencingService) {
        this.sequencingService = sequencingService;
    }

    @Operation(summary = "Calculate optimal tour using Held-Karp DP exact solver")
    @ApiResponse(responseCode = "200", description = "Successfully calculated optimal tour")
    @ApiResponse(responseCode = "400", description = "Invalid request or unreachable stops")
    @PostMapping("/optimize/exact")
    public ResponseEntity<SequencingResponse> optimizeExact(@Valid @RequestBody SequencingRequest request) {
        return ResponseEntity.ok(sequencingService.calculateExactTour(request));
    }

    @Operation(summary = "Calculate tour using 2-opt local search heuristic solver")
    @ApiResponse(responseCode = "200", description = "Successfully calculated heuristic tour")
    @ApiResponse(responseCode = "400", description = "Invalid request or unreachable stops")
    @PostMapping("/optimize/heuristic")
    public ResponseEntity<SequencingResponse> optimizeHeuristic(@Valid @RequestBody SequencingRequest request) {
        return ResponseEntity.ok(sequencingService.calculateHeuristicTour(request));
    }

    @Operation(summary = "Compare exact and heuristic solvers side-by-side")
    @ApiResponse(responseCode = "200", description = "Successfully compared solvers")
    @ApiResponse(responseCode = "400", description = "Invalid request or unreachable stops")
    @PostMapping("/optimize/compare")
    public ResponseEntity<ComparisonResponse> compare(@Valid @RequestBody SequencingRequest request) {
        return ResponseEntity.ok(sequencingService.compareSolvers(request));
    }

    @Operation(summary = "Build and retrieve the raw distance matrix for the given stops")
    @ApiResponse(responseCode = "200", description = "Successfully constructed distance matrix")
    @ApiResponse(responseCode = "400", description = "Invalid list of node IDs")
    @PostMapping("/distance-matrix")
    public ResponseEntity<double[][]> distanceMatrix(@RequestBody List<Long> stopNodeIds) {
        return ResponseEntity.ok(sequencingService.getDistanceMatrix(stopNodeIds));
    }
}
