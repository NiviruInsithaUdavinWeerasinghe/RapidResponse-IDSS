package com.rapidresponse.route.algorithm;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

import org.springframework.stereotype.Component;

import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;

/**
 * A* shortest-path finder using straight-line (haversine) distance as an admissible heuristic.
 */
@Component
public class AStarPathfinder {

    private static final double EARTH_RADIUS_KM = 6371.0;

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

        Node target = graph.getNode(targetId);
        Map<Long, Double> gScore = new HashMap<>();
        Map<Long, Double> travelTimes = new HashMap<>();
        Map<Long, Long> parentMap = new HashMap<>();

        for (Long nodeId : graph.getAllNodeIds()) {
            gScore.put(nodeId, Double.POSITIVE_INFINITY);
            travelTimes.put(nodeId, 0.0);
        }
        gScore.put(sourceId, 0.0);

        PriorityQueue<NodeScore> openSet = new PriorityQueue<>(Comparator.comparingDouble(pair -> pair.fScore));
        openSet.add(new NodeScore(sourceId, 0.0, heuristicKm(graph.getNode(sourceId), target)));

        int nodesExplored = 0;

        while (!openSet.isEmpty()) {
            NodeScore current = openSet.poll();
            nodesExplored++;

            if (current.nodeId.equals(targetId)) {
                return PathReconstruction.fromParents(
                        targetId,
                        parentMap,
                        gScore,
                        travelTimes,
                        nodesExplored,
                        System.nanoTime() - startTimeNanos
                );
            }

            if (current.gScore > gScore.get(current.nodeId)) {
                continue;
            }

            for (Edge edge : graph.getNeighbors(current.nodeId)) {
                if (edge.isBlocked()) {
                    continue;
                }

                Long neighborId = edge.getTargetId();
                double tentativeG = current.gScore + edge.getDistanceKm();

                if (tentativeG < gScore.get(neighborId)) {
                    gScore.put(neighborId, tentativeG);
                    travelTimes.put(neighborId, travelTimes.get(current.nodeId) + edge.getTravelTimeMins());
                    parentMap.put(neighborId, current.nodeId);
                    double fScore = tentativeG + heuristicKm(graph.getNode(neighborId), target);
                    openSet.add(new NodeScore(neighborId, tentativeG, fScore));
                }
            }
        }

        return PathResult.unreachable(nodesExplored, System.nanoTime() - startTimeNanos);
    }

    static double heuristicKm(Node from, Node to) {
        double lat1 = Math.toRadians(from.getLatitude());
        double lat2 = Math.toRadians(to.getLatitude());
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(to.getLongitude() - from.getLongitude());
        double hav = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1.0, Math.sqrt(hav)));
    }

    private record NodeScore(Long nodeId, double gScore, double fScore) {
    }
}
