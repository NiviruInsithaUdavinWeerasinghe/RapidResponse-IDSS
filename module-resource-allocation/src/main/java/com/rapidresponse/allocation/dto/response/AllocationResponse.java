package com.rapidresponse.allocation.dto.response;

import java.util.List;

public record AllocationResponse(
        List<String> selectedResourceNames,
        double totalValue,
        double totalWeight,
        double capacityUsed,
        String algorithmUsed,
        int nodesExplored,      // 0 for greedy (not applicable)
        int nodesPruned,        // 0 for greedy (not applicable)
        long executionTimeNanos
) {
}
