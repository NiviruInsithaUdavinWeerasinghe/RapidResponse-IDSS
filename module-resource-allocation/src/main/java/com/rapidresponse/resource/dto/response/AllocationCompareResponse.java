package com.rapidresponse.resource.dto.response;

public record AllocationCompareResponse(
        AllocationResultResponse exact,
        AllocationResultResponse heuristic,
        double heuristicRatio
) {
}
