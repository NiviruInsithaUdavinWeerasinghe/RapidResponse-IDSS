package com.rapidresponse.route.algorithm;

import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.route.model.PathResult;

import java.util.Collections;

/**
 * Dijkstra Shortest Pathfinder class.
 * 
 * <p>Scaffolded as a mock/stub to support compiler dependencies and allow 
 * testing of Module 5 Route Sequencing matrix builders.
 */
public class DijkstraPathfinder {

    public PathResult findShortestPath(Graph graph, Long sourceId, Long targetId) {
        if (sourceId == null || targetId == null) {
            throw new IllegalArgumentException("Source and target IDs must not be null.");
        }
        
        // Default stub mock implementation:
        // Returns 0 distance for self-path, otherwise 1.0 km.
        boolean isSelf = sourceId.equals(targetId);
        return PathResult.builder()
                .nodeSequence(isSelf ? Collections.singletonList(sourceId) : java.util.Arrays.asList(sourceId, targetId))
                .totalDistanceKm(isSelf ? 0.0 : 1.0)
                .totalTravelTimeMins(isSelf ? 0.0 : 2.0)
                .nodesExplored(1)
                .executionTimeNanos(100L)
                .build();
    }
}
