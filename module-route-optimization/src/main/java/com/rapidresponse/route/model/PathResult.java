package com.rapidresponse.route.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * Result container for Module 1 pathfinders (Dijkstra and A*).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathResult {

    public static final String STATUS_SUCCESS = "SUCCESS";
    public static final String STATUS_NO_PATH = "NO_PATH_FOUND";

    @Builder.Default
    private String status = STATUS_SUCCESS;
    private List<Long> nodeSequence;
    private double totalDistanceKm;
    private double totalTravelTimeMins;
    private int nodesExplored;
    private long executionTimeNanos;

    public static PathResult success(List<Long> nodeSequence, double totalDistanceKm,
                                     double totalTravelTimeMins, int nodesExplored,
                                     long executionTimeNanos) {
        return PathResult.builder()
                .status(STATUS_SUCCESS)
                .nodeSequence(List.copyOf(nodeSequence))
                .totalDistanceKm(totalDistanceKm)
                .totalTravelTimeMins(totalTravelTimeMins)
                .nodesExplored(nodesExplored)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }

    public static PathResult unreachable(int nodesExplored, long executionTimeNanos) {
        return PathResult.builder()
                .status(STATUS_NO_PATH)
                .nodeSequence(Collections.emptyList())
                .totalDistanceKm(0.0)
                .totalTravelTimeMins(0.0)
                .nodesExplored(nodesExplored)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }
}
