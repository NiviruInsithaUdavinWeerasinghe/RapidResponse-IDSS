package com.rapidresponse.app.dto.response;

import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;

import java.util.List;
import java.util.Map;

/**
 * Consolidated master response for the Full End-to-End Disaster Response Pipeline.
 *
 * <p>Integrates telemetry and outputs from all 5 modules:
 * <ul>
 *   <li>Stage 1 (Module 3): Network connectivity, component breakdown & MST</li>
 *   <li>Stage 2 (Module 1): Pre-check instant reachability validation via Union-Find</li>
 *   <li>Stage 3 (Module 4): SOS prioritization & camp selection</li>
 *   <li>Stage 4 (Module 2): Resource payload allocation & knapsack packing</li>
 *   <li>Stage 5 (Module 5): Optimal TSP delivery tour route sequencing</li>
 * </ul>
 */
public record FullResponsePipelineResponse(
        String status,                               // "SUCCESS", "PARTIAL_SUCCESS", "FAILED"
        String message,                              // Overall summary description
        ReachabilityResponse networkReachability,    // Stage 1 (Module 3)
        MstResponse networkMst,                      // Stage 1 (Module 3)
        Map<Long, Boolean> preCheckReachabilityMap,  // Stage 2 (Module 1 / Module 3)
        DecisionResultResponse decisionResult,       // Stage 3 (Module 4)
        AllocationResultResponse resourceAllocation, // Stage 4 (Module 2)
        List<TourStopResponse> deliveryTourSequence, // Stage 5 (Module 5)
        Double totalTourDistanceKm,                  // Stage 5 (Module 5)
        String sequencingAlgorithmUsed,              // Stage 5 (Module 5)
        Map<String, Long> stageExecutionTimesNanos,  // Stage timing metrics
        StageTelemetryResponse telemetry,            // Detailed multi-stage telemetry
        long totalPipelineTimeNanos                  // Total end-to-end execution time
) {

    public FullResponsePipelineResponse(
            String status,
            String message,
            ReachabilityResponse networkReachability,
            MstResponse networkMst,
            Map<Long, Boolean> preCheckReachabilityMap,
            DecisionResultResponse decisionResult,
            AllocationResultResponse resourceAllocation,
            List<TourStopResponse> deliveryTourSequence,
            Double totalTourDistanceKm,
            String sequencingAlgorithmUsed,
            Map<String, Long> stageExecutionTimesNanos,
            long totalPipelineTimeNanos) {
        this(
                status,
                message,
                networkReachability,
                networkMst,
                preCheckReachabilityMap,
                decisionResult,
                resourceAllocation,
                deliveryTourSequence,
                totalTourDistanceKm,
                sequencingAlgorithmUsed,
                stageExecutionTimesNanos,
                StageTelemetryResponse.fromTimings(stageExecutionTimesNanos != null ? stageExecutionTimesNanos : Map.of(), totalPipelineTimeNanos),
                totalPipelineTimeNanos
        );
    }
}
