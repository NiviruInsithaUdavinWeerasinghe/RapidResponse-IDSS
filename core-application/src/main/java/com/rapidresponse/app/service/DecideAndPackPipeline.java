package com.rapidresponse.app.service;

import com.rapidresponse.app.dto.request.DecideAndPackRequest;
import com.rapidresponse.app.dto.response.DecideAndPackResponse;
import com.rapidresponse.decision.dto.request.DecisionRequest;
import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.decision.service.DecisionService;
import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;
import com.rapidresponse.resource.service.ResourceService;
import org.springframework.stereotype.Service;

/**
 * Orchestrator pipeline connecting Module 4 (Intelligent Decision) and Module 2 (Resource Packing).
 *
 * <p>Implements Issue #29: Approved SOS -> Resource Packing.
 */
@Service
public class DecideAndPackPipeline {

    private final DecisionService decisionService;
    private final ResourceService resourceService;

    public DecideAndPackPipeline(DecisionService decisionService, ResourceService resourceService) {
        this.decisionService = decisionService;
        this.resourceService = resourceService;
    }

    /**
     * Executes the end-to-end Decide & Pack pipeline.
     *
     * @param request configuration parameters for both modules
     * @return combined response containing decision ranking and helicopter packing allocation
     */
    public DecideAndPackResponse execute(DecideAndPackRequest request) {
        long startTime = System.nanoTime();

        // ── Step 1: Execute Module 4 (Multi-Criteria SOS Optimization) ───────────
        double sevW = request.severityWeight() != null ? request.severityWeight() : 0.5;
        double popW = request.populationWeight() != null ? request.populationWeight() : 0.3;
        double shoW = request.shortageWeight() != null ? request.shortageWeight() : 0.2;

        DecisionRequest decisionRequest = new DecisionRequest(
                request.maxDailyCapacity(),
                sevW,
                popW,
                shoW,
                null,
                request.directRequests()
        );

        DecisionResultResponse decisionResult;
        if ("HEURISTIC".equalsIgnoreCase(request.decisionAlgorithm())) {
            decisionResult = decisionService.optimizeHeuristic(decisionRequest);
        } else {
            decisionResult = decisionService.optimizeExact(decisionRequest);
        }

        // ── Step 2: Execute Module 2 (Optimal Helicopter Resource Packing) ───────
        Long heliId = request.helicopterId() != null ? request.helicopterId() : 1L;
        AllocationRequest allocationRequest = new AllocationRequest(heliId, request.itemIds());

        AllocationResultResponse allocationResult;
        if ("HEURISTIC".equalsIgnoreCase(request.packingAlgorithm())) {
            allocationResult = resourceService.allocateHeuristic(allocationRequest);
        } else {
            allocationResult = resourceService.allocateExact(allocationRequest);
        }

        long totalTimeNanos = System.nanoTime() - startTime;

        // ── Step 3: Compile Consolidated Telemetry ──────────────────────────────
        int approvedCampsCount = decisionResult.getSelectedRequests() != null ? decisionResult.getSelectedRequests().size() : 0;
        double trucksUsed = decisionResult.getTotalCapacityUsed();
        double payloadUsedKg = allocationResult.totalWeight();
        double payloadCapacityKg = allocationResult.payloadCapacityKg();

        String summary = String.format(
                "Pipeline completed successfully in %.2f ms. Module 4 selected %d critical camps " +
                "(using %.1f/%.1f rescue trucks). Module 2 packed %d relief items (%.1f/%.1f kg payload) into Helicopter #%d.",
                totalTimeNanos / 1_000_000.0,
                approvedCampsCount,
                trucksUsed,
                decisionResult.getMaxDailyCapacity(),
                allocationResult.selectedItems() != null ? allocationResult.selectedItems().size() : 0,
                payloadUsedKg,
                payloadCapacityKg,
                heliId
        );

        return new DecideAndPackResponse(
                decisionResult,
                allocationResult,
                approvedCampsCount,
                trucksUsed,
                payloadUsedKg,
                payloadCapacityKg,
                summary,
                totalTimeNanos
        );
    }
}
