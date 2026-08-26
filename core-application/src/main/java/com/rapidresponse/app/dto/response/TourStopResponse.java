package com.rapidresponse.app.dto.response;

/**
 * Encapsulates an individual stop within an optimized delivery tour sequence.
 */
public record TourStopResponse(
        int sequenceIndex,
        Long nodeId,
        String nodeName,
        String nodeType,
        double distanceFromPreviousKm
) {
}
