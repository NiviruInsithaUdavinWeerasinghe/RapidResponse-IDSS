package com.rapidresponse.app.dto.request;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import jakarta.validation.constraints.Positive;

import java.util.List;

/**
 * Request payload for the Module 4 -> Module 2 integration pipeline.
 *
 * <p>Implements Issue #29: Approved SOS -> Resource Packing.
 */
public record DecideAndPackRequest(
        @Positive(message = "maxDailyCapacity must be greater than 0")
        double maxDailyCapacity,

        Double severityWeight,
        Double populationWeight,
        Double shortageWeight,

        Long helicopterId,
        List<Long> itemIds,
        List<CreateSOSRequest> directRequests,

        String decisionAlgorithm, // "EXACT" | "HEURISTIC" (defaults to EXACT)
        String packingAlgorithm   // "EXACT" | "HEURISTIC" (defaults to EXACT)
) {
}
