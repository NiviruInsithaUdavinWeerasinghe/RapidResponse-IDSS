package com.rapidresponse.route.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result container for Module 1 pathfinders (Dijkstra and A*).
 * 
 * <p>Scaffolded as a stub to support compilation of Module 5 distance matrix building.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathResult {
    private List<Long> nodeSequence;
    private double totalDistanceKm;
    private double totalTravelTimeMins;
    private int nodesExplored;
    private long executionTimeNanos;
}
