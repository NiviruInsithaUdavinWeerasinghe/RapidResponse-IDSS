package com.rapidresponse.resource.dto.response;

public record HelicopterResponse(
        Long id,
        String callSign,
        double maxPayloadKg,
        String status
) {
}
