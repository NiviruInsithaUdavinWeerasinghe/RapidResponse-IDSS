package com.rapidresponse.resource.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AllocationRequest(

        @NotNull
        Long helicopterId,
        List<Long> itemIds
) {
}
