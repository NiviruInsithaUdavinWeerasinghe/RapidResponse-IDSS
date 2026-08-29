package com.rapidresponse.app.dto.request;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import jakarta.validation.constraints.Positive;

import java.util.List;

/**
 * Request payload for the Module 4 -> Module 5 integration pipeline.
 *
 * <p>Implements Issue #30: Approved Camps -> Delivery Tour.
 */
public record DecideAndSequenceRequest(
        @Positive(message = "maxDailyCapacity must be greater than 0")
        double maxDailyCapacity,

        Double severityWeight,
        Double populationWeight,
        Double shortageWeight,

        Long depotNodeId, // ID of Central HQ depot node (defaults to 1L)
        List<CreateSOSRequest> directRequests,

        String decisionAlgorithm,   // "EXACT" | "HEURISTIC" (defaults to EXACT)
        String sequencingAlgorithm // "AUTO" | "HELD_KARP" | "TWO_OPT" (defaults to AUTO)
) {
}
