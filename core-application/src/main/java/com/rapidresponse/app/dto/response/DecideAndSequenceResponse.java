package com.rapidresponse.app.dto.response;

import com.rapidresponse.decision.dto.response.DecisionResultResponse;

import java.util.List;

/**
 * Combined response for the Module 4 -> Module 5 integration pipeline.
 *
 * <p>Implements Issue #30: Approved Camps -> Delivery Tour.
 */
public record DecideAndSequenceResponse(
        DecisionResultResponse decisionResult,
        List<TourStopResponse> tourSequence,
        double totalTourDistanceKm,
        int totalStopsCount,
        String sequencingAlgorithmUsed,
        String summary,
        long totalPipelineTimeNanos
) {
}
