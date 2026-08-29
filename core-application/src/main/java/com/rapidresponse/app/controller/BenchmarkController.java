package com.rapidresponse.app.controller;

import com.rapidresponse.app.dto.request.BenchmarkRunRequest;
import com.rapidresponse.app.service.BenchmarkService;
import com.rapidresponse.shared.benchmark.BenchmarkComparisonReport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/benchmark")
@Tag(name = "Benchmark", description = "Endpoints for benchmarking and comparing algorithms performance")
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    public BenchmarkController(BenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    @Operation(summary = "Run a scalability sweep comparing an exact algorithm against its heuristic counterpart",
            description = "algorithmPair is one of ROUTE_DIJKSTRA_VS_ASTAR, RESOURCE_BNB_VS_GREEDY, " +
                    "DECISION_BNB_VS_WEIGHTED_SCORING, SEQUENCING_HELDKARP_VS_TWOOPT. " +
                    "inputSizes and repetitions are optional and default to [10,20,50,100,200,500,1000] and 10.")
    @PostMapping("/run")
    public ResponseEntity<BenchmarkComparisonReport> run(@Valid @RequestBody BenchmarkRunRequest request) {
        return ResponseEntity.ok(benchmarkService.run(request));
    }

    @Operation(summary = "List the algorithm pairs available for benchmarking")
    @GetMapping("/pairs")
    public ResponseEntity<List<String>> listAvailablePairs() {
        return ResponseEntity.ok(benchmarkService.listAvailablePairs());
    }
}