package com.rapidresponse.resource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record HelicopterRequest(

        @NotBlank(message = "callSign is required")
        String callSign,
        @Positive(message = "maxPayloadKg must be greater than 0")
        double maxPayloadKg,
        @NotBlank(message = "status is required")
        String status   // AVAILABLE, DEPLOYED, MAINTENANCE
) {
}
