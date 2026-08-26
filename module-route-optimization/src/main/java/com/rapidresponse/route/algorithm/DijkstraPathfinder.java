package com.rapidresponse.route.algorithm;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

import org.springframework.stereotype.Component;

import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;

/**
 * Dijkstra shortest-path finder using a binary min-heap.
 * Time complexity: O((V + E) log V).
 */

@Component
public class DijkstraPathfinder {

    public PathResult findShortestPath(Graph graph, Long sourceId, Long targetId) {
        if (sourceId == null || targetId == null) {
            throw new IllegalArgumentException("Source and target IDs must not be null.");
        }
        if (graph.getNode(sourceId) == null) {
            throw new IllegalArgumentException("Source node not found: " + sourceId);
        }
        if (graph.getNode(targetId) == null) {
            throw new IllegalArgumentException("Target node not found: " + targetId);
        }

        long startTimeNanos = System.nanoTime();

        if (sourceId.equals(targetId)) {
            return PathResult.success(
                    java.util.List.of(sourceId),
                    0.0,
                    0.0,
                    1,
                    System.nanoTime() - startTimeNanos
            );
        }

        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Double> travelTimes = new HashMap<>();
        Map<Long, Long> parentMap = new HashMap<>();

        for (Long nodeId : graph.getAllNodeIds()) {
            distances.put(nodeId, Double.POSITIVE_INFINITY);
            travelTimes.put(nodeId, 0.0);
        }
        distances.put(sourceId, 0.0);

        PriorityQueue<NodeDistance> minHeap = new PriorityQueue<>(Comparator.comparingDouble(pair -> pair.distance));
        minHeap.add(new NodeDistance(sourceId, 0.0));

        int nodesExplored = 0;

        while (!minHeap.isEmpty()) {
            NodeDistance current = minHeap.poll();
            nodesExplored++;

            if (current.nodeId.equals(targetId)) {
                return PathReconstruction.fromParents(
                        targetId,
                        parentMap,
                        distances,
                        travelTimes,
                        nodesExplored,
                        System.nanoTime() - startTimeNanos
                );
            }

            if (current.distance > distances.get(current.nodeId)) {
                continue;
            }

            for (Edge edge : graph.getNeighbors(current.nodeId)) {
                if (edge.isBlocked()) {
                    continue;
                }

                Long neighborId = edge.getTargetId();
                double newDistance = current.distance + edge.getDistanceKm();

                if (newDistance < distances.get(neighborId)) {
                    distances.put(neighborId, newDistance);
                    travelTimes.put(neighborId, travelTimes.get(current.nodeId) + edge.getTravelTimeMins());
                    parentMap.put(neighborId, current.nodeId);
                    minHeap.add(new NodeDistance(neighborId, newDistance));
                }
            }
        }

        return PathResult.unreachable(nodesExplored, System.nanoTime() - startTimeNanos);
    }

    private record NodeDistance(Long nodeId, double distance) {
    }
}
