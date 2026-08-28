package com.rapidresponse.route.dto.request;

import jakarta.validation.constraints.NotNull;

public record RouteRequest(
        @NotNull(message = "sourceId must not be null")
        Long sourceId,

        @NotNull(message = "targetId must not be null")
        Long targetId
) {
}
