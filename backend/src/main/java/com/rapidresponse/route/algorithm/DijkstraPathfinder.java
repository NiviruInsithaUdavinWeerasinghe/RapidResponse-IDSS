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
        // Initializes distances to infinity
        Map<Node, Double> distances = new HashMap<>();
        for (Node node : graph.getNodes()) {
            distances.put(node, Double.POSITIVE_INFINITY);
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
            Node currentNode = currentPair.node;
            double currentDist = currentPair.distance;

            // Early termination when the target node is popped
            if (currentNode.equals(target)) {
                return buildPathResult(target, parentMap, distances.get(target), nodesExplored);
            }

            // Skip if we found a shorter path to currentNode already
            if (currentDist > distances.get(currentNode)) {
                continue;
            }

            // Incrementing the nodesExplored counter when expanding a node
            nodesExplored++;

            for (Edge edge : graph.getEdges(currentNode)) {
                // Skips edges where isBlocked == true
                if (edge.isBlocked()) {
                    continue;
                }

                Node neighbor = edge.getDestination();
                double newDist = currentDist + edge.getWeight();

                if (newDist < distances.get(neighbor)) {
                    distances.put(neighbor, newDist);
                    parentMap.put(neighbor, currentNode);
                    minHeap.add(new NodeDistancePair(neighbor, newDist));
                }
            }
        }

        // Correctly handles disconnected nodes returning a NO_PATH_FOUND result
        return new PathResult("NO_PATH_FOUND", Collections.emptyList(), Double.POSITIVE_INFINITY, nodesExplored);
    }

    /**
     * Backtracks the parent map to construct the path and returns the SUCCESS result.
     */
    private PathResult buildPathResult(Node target, Map<Node, Node> parentMap, double totalDistance, int nodesExplored) {
        List<Node> path = new ArrayList<>();
        Node current = target;
        while (current != null) {
            path.add(current);
            current = parentMap.get(current);
        }
        Collections.reverse(path);
        
        return new PathResult("SUCCESS", path, totalDistance, nodesExplored);
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
