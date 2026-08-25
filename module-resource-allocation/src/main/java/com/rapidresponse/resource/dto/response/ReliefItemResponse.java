package com.rapidresponse.resource.dto.response;

import com.rapidresponse.resource.entity.ReliefCategory;

public record ReliefItemResponse(
        Long id,
        String name,
        double weightKg,
        double priorityValue,
        ReliefCategory category
) {
}
