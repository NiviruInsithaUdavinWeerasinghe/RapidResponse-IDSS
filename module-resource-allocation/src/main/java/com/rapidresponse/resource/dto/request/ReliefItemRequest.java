package com.rapidresponse.resource.dto.request;

import com.rapidresponse.resource.entity.ReliefCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ReliefItemRequest(

        @NotBlank(message = "name is required")
        String name,

        @Positive(message = "weightKg must be greater than 0")
        double weightKg,

        @Positive(message = "priorityValue must be greater than 0")
        double priorityValue,

        @NotNull(message = "category is required")
        ReliefCategory category
) {
}
