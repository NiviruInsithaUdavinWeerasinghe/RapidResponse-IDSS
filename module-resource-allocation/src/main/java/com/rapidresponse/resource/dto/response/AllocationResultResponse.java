package com.rapidresponse.resource.dto.response;

import java.util.List;

public record AllocationResultResponse(
        String algorithm,
        List<ReliefItemResponse> selectedItems,
        double totalValue,
        double totalWeight,
        double payloadCapacityKg,
        long executionTimeNanos
) {
}
