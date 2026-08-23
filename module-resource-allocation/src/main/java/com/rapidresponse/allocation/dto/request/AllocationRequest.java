package com.rapidresponse.allocation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AllocationRequest(

        @NotNull(message = "capacity is required")
        @Positive(message = "capacity must be greater than 0")
        Double capacity,

        // "branch_and_bound" (exact, default) or "greedy" (strengthened 2-approximation)
        String algorithm
) {
}
