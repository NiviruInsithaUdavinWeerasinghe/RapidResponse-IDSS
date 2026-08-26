package com.rapidresponse.route.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

public class AStarPathfinder {

    private static class QueueNode implements Comparable<QueueNode> {
        Long id;
        double fScore; // g(n) + h(n)
        double gScore; // g(n)

        public QueueNode(Long id, double fScore, double gScore) {
            this.id = id;
            this.fScore = fScore;
            this.gScore = gScore;
        }

        @Override
        public int compareTo(QueueNode other) {
            return Double.compare(this.fScore, other.fScore);
        }
    }

    public PathResult findShortestPath(Graph graph, Long sourceId, Long targetId) {
        long startTime = System.nanoTime();
        
        Map<Long, Double> gScores = new HashMap<>(); // distances from start
        Map<Long, Long> parent = new HashMap<>();
        Map<Long, Double> travelTimes = new HashMap<>();
        PriorityQueue<QueueNode> minHeap = new PriorityQueue<>();

        // Initialize gScores for all nodes in the graph
        for (Long nodeId : graph.getNodes().keySet()) {
            gScores.put(nodeId, Double.POSITIVE_INFINITY);
            travelTimes.put(nodeId, Double.POSITIVE_INFINITY);
        }
        
        // Also support nodes that might only be in adjacency lists or just the source directly
        gScores.put(sourceId, 0.0);
        travelTimes.put(sourceId, 0.0);
        
        Node targetNode = graph.getNode(targetId);
        double targetLat = targetNode != null ? targetNode.getLat() : 0.0;
        double targetLon = targetNode != null ? targetNode.getLon() : 0.0;
        
        Node sourceNode = graph.getNode(sourceId);
        double sourceLat = sourceNode != null ? sourceNode.getLat() : 0.0;
        double sourceLon = sourceNode != null ? sourceNode.getLon() : 0.0;

        double hScoreStart = HaversineHeuristic.calculate(sourceLat, sourceLon, targetLat, targetLon);
        minHeap.add(new QueueNode(sourceId, hScoreStart, 0.0));
        
        int nodesExplored = 0;
        boolean found = false;

        while (!minHeap.isEmpty()) {
            QueueNode current = minHeap.poll();
            nodesExplored++;
            
            if (current.id.equals(targetId)) {
                found = true;
                break;
            }

            // Optimization: if we have found a shorter path already to this node, skip
            if (current.gScore > gScores.getOrDefault(current.id, Double.POSITIVE_INFINITY)) {
                continue;
            }

            for (Edge edge : graph.getEdges(current.id)) {
                if (edge.isBlocked()) continue;
                
                Long neighborId = edge.getTargetId();
                double tentativeGScore = current.gScore + edge.getDistance();
                
                if (tentativeGScore < gScores.getOrDefault(neighborId, Double.POSITIVE_INFINITY)) {
                    gScores.put(neighborId, tentativeGScore);
                    travelTimes.put(neighborId, travelTimes.getOrDefault(current.id, 0.0) + edge.getTravelTime());
                    parent.put(neighborId, current.id);
                    
                    Node neighborNode = graph.getNode(neighborId);
                    double nLat = neighborNode != null ? neighborNode.getLat() : 0.0;
                    double nLon = neighborNode != null ? neighborNode.getLon() : 0.0;
                    double hScore = HaversineHeuristic.calculate(nLat, nLon, targetLat, targetLon);
                    
                    minHeap.add(new QueueNode(neighborId, tentativeGScore + hScore, tentativeGScore));
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
            totalDistance = gScores.get(targetId);
            totalTravelTime = travelTimes.get(targetId);
        }

        long executionTime = System.nanoTime() - startTime;

        if (!found) {
            return PathResult.NO_PATH_FOUND;
        }
        
        return new PathResult(path, totalDistance, totalTravelTime, nodesExplored, executionTime);
    }
}
