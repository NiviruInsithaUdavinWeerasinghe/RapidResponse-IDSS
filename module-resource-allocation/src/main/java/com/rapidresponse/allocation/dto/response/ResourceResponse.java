package com.rapidresponse.allocation.dto.response;

public record ResourceResponse(
        Long id,
        String name,
        int weight,
        int value,
        String category
) {
}