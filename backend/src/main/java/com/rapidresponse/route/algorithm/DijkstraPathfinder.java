package com.rapidresponse.route.algorithm;

import java.util.*;

public class DijkstraPathfinder {

    /**
     * Finds the shortest path between the source and target nodes using Dijkstra's Algorithm.
     * Uses a binary min-heap (PriorityQueue) to achieve O((V+E)log V) time complexity.
     *
     * @param graph  The graph containing nodes and edges.
     * @param source The starting node.
     * @param target The destination node.
     * @return PathResult containing the path, status, distance, and nodes explored.
     */
    public PathResult findShortestPath(Graph graph, Node source, Node target) {
        long startTimeNanos = System.nanoTime();

        // Initializes distances to infinity
        Map<Node, Double> distances = new HashMap<>();
        Map<Node, Double> travelTimes = new HashMap<>();
        for (Node node : graph.getNodes()) {
            distances.put(node, Double.POSITIVE_INFINITY);
            travelTimes.put(node, 0.0);
        }

        // Sets source distance to 0
        distances.put(source, 0.0);

        // Maintains a parent tracking map for backtracking node sequences
        Map<Node, Node> parentMap = new HashMap<>();

        // Binary min-heap (PriorityQueue) for O((V+E)log V)
        PriorityQueue<NodeDistancePair> minHeap = new PriorityQueue<>(Comparator.comparingDouble(pair -> pair.distance));
        minHeap.add(new NodeDistancePair(source, 0.0));

        int nodesExplored = 0;

        while (!minHeap.isEmpty()) {
            NodeDistancePair currentPair = minHeap.poll();
            
            // Accurately records every node dequeued from the priority queue
            nodesExplored++;

            Node currentNode = currentPair.node;
            double currentDist = currentPair.distance;

            // Early termination when the target node is popped
            if (currentNode.equals(target)) {
                long executionTimeNanos = System.nanoTime() - startTimeNanos;
                return buildPathResult(target, parentMap, distances.get(target), travelTimes.get(target), nodesExplored, executionTimeNanos);
            }

            // Skip if we found a shorter path to currentNode already
            if (currentDist > distances.get(currentNode)) {
                continue;
            }

            for (Edge edge : graph.getEdges(currentNode)) {
                // Skips edges where isBlocked == true
                if (edge.isBlocked()) {
                    continue;
                }

                Node neighbor = edge.getDestination();
                
                // Assuming edge provides getDistance() for distance and getTravelTime() for time
                double newDist = currentDist + edge.getDistance();

                if (newDist < distances.get(neighbor)) {
                    distances.put(neighbor, newDist);
                    travelTimes.put(neighbor, travelTimes.get(currentNode) + edge.getTravelTime());
                    parentMap.put(neighbor, currentNode);
                    minHeap.add(new NodeDistancePair(neighbor, newDist));
                }
            }
        }

        long executionTimeNanos = System.nanoTime() - startTimeNanos;
        // Correctly handles disconnected nodes returning a NO_PATH_FOUND result
        return new PathResult("NO_PATH_FOUND", Collections.emptyList(), Double.POSITIVE_INFINITY, 0.0, nodesExplored, executionTimeNanos);
    }

    /**
     * Backtracks the parent map to construct the path and returns the SUCCESS result.
     */
    private PathResult buildPathResult(Node target, Map<Node, Node> parentMap, double totalDistance, double totalTravelTime, int nodesExplored, long executionTimeNanos) {
        List<String> pathNodeIds = new ArrayList<>();
        Node current = target;
        while (current != null) {
            pathNodeIds.add(String.valueOf(current.getId()));
            current = parentMap.get(current);
        }
        Collections.reverse(pathNodeIds);
        
        return new PathResult("SUCCESS", pathNodeIds, totalDistance, totalTravelTime, nodesExplored, executionTimeNanos);
    }

    // Helper class to store node and its current known distance for the PriorityQueue
    private static class NodeDistancePair {
        Node node;
        double distance;

        public NodeDistancePair(Node node, double distance) {
            this.node = node;
            this.distance = distance;
        }
    }
}
