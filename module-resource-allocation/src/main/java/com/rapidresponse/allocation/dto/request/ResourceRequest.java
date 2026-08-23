package com.rapidresponse.allocation.dto.request;

public record ResourceRequest(
        String name,
        int weight,
        int value,
        String category
) {
}
