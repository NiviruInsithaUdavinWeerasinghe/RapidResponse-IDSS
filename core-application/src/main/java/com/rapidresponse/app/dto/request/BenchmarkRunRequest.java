package com.rapidresponse.app.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record BenchmarkRunRequest(
        @NotBlank(message = "algorithmPair is required")
        String algorithmPair,
        List<Integer> inputSizes,
        Integer repetitions
) {
}