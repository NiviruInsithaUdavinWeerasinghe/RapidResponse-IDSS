package com.rapidresponse.app.dto.response;

import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;

/**
 * Combined response for the Module 4 -> Module 2 integration pipeline.
 *
 * <p>Implements Issue #29: Approved SOS -> Resource Packing.
 */
public record DecideAndPackResponse(
        DecisionResultResponse decisionResult,
        AllocationResultResponse allocationResult,
        int totalApprovedCamps,
        double totalRescueTrucksUsed,
        double helicopterPayloadUsedKg,
        double helicopterPayloadCapacityKg,
        String summary,
        long totalPipelineTimeNanos
) {
}
