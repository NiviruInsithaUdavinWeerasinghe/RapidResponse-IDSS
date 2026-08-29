package com.rapidresponse.route.dto.response;

public record NeighborResponse(
        Long nodeId,
        String name,
        double latitude,
        double longitude,
        double distanceKm,
        double travelTimeMins,
        boolean blocked
) {
}
