package com.rapidresponse.route.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public class DijkstraPathfinder {

    private static class QueueNode implements Comparable<QueueNode> {
        Long id;
        double distance;

        public QueueNode(Long id, double distance) {
            this.id = id;
            this.distance = distance;
        }

        @Override
        public int compareTo(QueueNode other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    public PathResult findShortestPath(Graph graph, Long sourceId, Long targetId) {
        long startTime = System.nanoTime();
        
        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Long> parent = new HashMap<>();
        Map<Long, Double> travelTimes = new HashMap<>();
        PriorityQueue<QueueNode> minHeap = new PriorityQueue<>();

        // Initialize distances for all nodes in the graph
        for (Long nodeId : graph.getNodes().keySet()) {
            distances.put(nodeId, Double.POSITIVE_INFINITY);
            travelTimes.put(nodeId, Double.POSITIVE_INFINITY);
        }
        
        // Also support nodes that might only be in adjacency lists or just the source directly
        distances.put(sourceId, 0.0);
        travelTimes.put(sourceId, 0.0);
        
        minHeap.add(new QueueNode(sourceId, 0.0));
        int nodesExplored = 0;

        boolean found = false;

        while (!minHeap.isEmpty()) {
            QueueNode current = minHeap.poll();
            nodesExplored++;

            if (current.id.equals(targetId)) {
                found = true;
                break;
            }

            // Optimization: if we have found a shorter path already, skip
            if (current.distance > distances.getOrDefault(current.id, Double.POSITIVE_INFINITY)) {
                continue;
            }

            for (Edge edge : graph.getEdges(current.id)) {
                if (edge.isBlocked()) continue;
                
                Long neighborId = edge.getTargetId();
                double newDist = distances.get(current.id) + edge.getDistance();
                
                if (newDist < distances.getOrDefault(neighborId, Double.POSITIVE_INFINITY)) {
                    distances.put(neighborId, newDist);
                    travelTimes.put(neighborId, travelTimes.getOrDefault(current.id, 0.0) + edge.getTravelTime());
                    parent.put(neighborId, current.id);
                    minHeap.add(new QueueNode(neighborId, newDist));
                }
            }
        }

        List<Long> path = new ArrayList<>();
        double totalDistance = 0.0;
        double totalTravelTime = 0.0;

        if (found) {
            Long curr = targetId;
            while (curr != null) {
                path.add(curr);
                curr = parent.get(curr);
            }
            Collections.reverse(path);
            totalDistance = distances.get(targetId);
            totalTravelTime = travelTimes.get(targetId);
        }

        long executionTime = System.nanoTime() - startTime;

        if (!found) {
            return PathResult.NO_PATH_FOUND;
        }
        
        return new PathResult(path, totalDistance, totalTravelTime, nodesExplored, executionTime);
    }
}
