package com.rapidresponse.sequencing.service;

import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Graph;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Builds the pairwise distance matrix between stops in a batch by repeatedly
 * calling the Module 1 pathfinders.
 *
 * <p>Implements Issue #26 — Module 5 Route Sequencing.
 *
 * @author NiviruInsithaUdavinWeerasinghe
 */
@Service
public class DistanceMatrixBuilder {

    private final DijkstraPathfinder dijkstra;
    private final Map<String, PathResult> pathCache = new ConcurrentHashMap<>();

    /**
     * Constructs the builder injecting Module 1's pathfinder.
     *
     * @param dijkstra pathfinder instance from module-route-optimization
     */
    public DistanceMatrixBuilder(DijkstraPathfinder dijkstra) {
        this.dijkstra = dijkstra;
    }

    /**
     * Builds a pairwise shortest-path distance matrix for the given stop nodes.
     *
     * @param graph       the road network graph
     * @param stopNodeIds list of unique node IDs representing stop locations
     * @return square n×n distance matrix
     * @throws IllegalArgumentException if stopNodeIds is empty, has nulls, or node IDs do not exist in graph
     * @throws NullPointerException     if graph or stopNodeIds is null
     */
    public double[][] buildMatrix(Graph graph, List<Long> stopNodeIds) {
        if (graph == null) {
            throw new NullPointerException("graph must not be null.");
        }
        if (stopNodeIds == null) {
            throw new NullPointerException("stopNodeIds must not be null.");
        }

        int n = stopNodeIds.size();
        if (n == 0) {
            throw new IllegalArgumentException("stopNodeIds list must not be empty.");
        }

        // Validate all node IDs exist in the graph
        for (int i = 0; i < n; i++) {
            Long nodeId = stopNodeIds.get(i);
            if (nodeId == null) {
                throw new IllegalArgumentException("stopNodeIds must not contain null elements.");
            }
            if (graph.getNode(nodeId) == null) {
                throw new IllegalArgumentException("Node ID " + nodeId + " does not exist in graph.");
            }
        }

        double[][] matrix = new double[n][n];

        for (int i = 0; i < n; i++) {
            Long sourceId = stopNodeIds.get(i);
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    matrix[i][j] = 0.0;
                    continue;
                }

                Long targetId = stopNodeIds.get(j);
                String cacheKey = sourceId + "-" + targetId;

                // Run shortest path calculation
                PathResult pathResult = dijkstra.findShortestPath(graph, sourceId, targetId);

                if (pathResult == null || pathResult.getNodeSequence() == null || pathResult.getNodeSequence().isEmpty()) {
                    matrix[i][j] = Double.MAX_VALUE / 2; // Unreachable
                } else {
                    matrix[i][j] = pathResult.getTotalDistanceKm();
                    // Cache the actual path details for later retrieval/visualization
                    pathCache.put(cacheKey, pathResult);
                }
            }
        }

        return matrix;
    }

    /**
     * Returns a copy of the calculated path results map.
     * Used by controllers/visualization layers to display actual road paths on maps.
     *
     * @return map of key "sourceId-targetId" -> pathfinding result details
     */
    public Map<String, PathResult> getCachedPaths() {
        return new HashMap<>(pathCache);
    }

    /**
     * Clears the path cache.
     */
    public void clearCache() {
        pathCache.clear();
    }
}
