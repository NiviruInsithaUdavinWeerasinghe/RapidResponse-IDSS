package com.rapidresponse.shared.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * In-memory Graph data structure using an Adjacency List representation.
 * Optimized for the disaster-zone road network with O(V + E) space complexity.
 * <p>
 * Consumed by Modules 1 (Route Optimization), 3 (Resource Allocation), and 5 (Optimization).
 */
public class Graph {

    private final Map<Long, Node> nodes = new HashMap<>();
    private final Map<Long, List<Edge>> adjacencyList = new HashMap<>();
    private int edgeCount = 0;

    /**
     * Adds a node to the graph. If a node with the same id already exists, it is replaced.
     *
     * @param node the node to add
     * @throws IllegalArgumentException if node is null
     */
    public void addNode(Node node) {
        if (node == null) {
            throw new IllegalArgumentException("Node cannot be null");
        }
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    /**
     * Adds a directed edge from sourceId to targetId.
     * Both source and target nodes must already exist in the graph.
     * Self-loops (sourceId == targetId) are rejected.
     *
     * @param sourceId       the source node id
     * @param targetId       the target node id
     * @param distanceKm     the distance in kilometers
     * @param travelTimeMins the travel time in minutes
     * @throws IllegalArgumentException if source or target node does not exist, or if it is a self-loop
     */
    public void addEdge(Long sourceId, Long targetId, double distanceKm, double travelTimeMins) {
        if (sourceId.equals(targetId)) {
            throw new IllegalArgumentException("Self-loops are not allowed: nodeId=" + sourceId);
        }
        if (!nodes.containsKey(sourceId)) {
            throw new IllegalArgumentException("Source node not found: " + sourceId);
        }
        if (!nodes.containsKey(targetId)) {
            throw new IllegalArgumentException("Target node not found: " + targetId);
        }

        Edge edge = new Edge(sourceId, targetId, distanceKm, travelTimeMins);
        adjacencyList.get(sourceId).add(edge);
        edgeCount++;
    }

    /**
     * Adds an undirected edge (two-way road) between sourceId and targetId.
     * Internally creates two directed edges.
     *
     * @param sourceId       the first node id
     * @param targetId       the second node id
     * @param distanceKm     the distance in kilometers
     * @param travelTimeMins the travel time in minutes
     */
    public void addUndirectedEdge(Long sourceId, Long targetId, double distanceKm, double travelTimeMins) {
        addEdge(sourceId, targetId, distanceKm, travelTimeMins);
        addEdge(targetId, sourceId, distanceKm, travelTimeMins);
    }

    /**
     * Returns the list of outgoing edges from the given node.
     *
     * @param nodeId the node id to query
     * @return an unmodifiable list of outgoing edges, or an empty list if the node has no edges or does not exist
     */
    public List<Edge> getNeighbors(Long nodeId) {
        List<Edge> edges = adjacencyList.get(nodeId);
        if (edges == null) {
            return Collections.emptyList();
        }
        return Collections.unmodifiableList(edges);
    }

    /**
     * Retrieves a node by its id.
     *
     * @param nodeId the node id
     * @return the Node, or null if not found
     */
    public Node getNode(Long nodeId) {
        return nodes.get(nodeId);
    }

    /**
     * Returns the total number of nodes in the graph.
     */
    public int getNodeCount() {
        return nodes.size();
    }

    /**
     * Returns the total number of directed edges in the graph.
     */
    public int getEdgeCount() {
        return edgeCount;
    }

    /**
     * Returns all node ids in the graph.
     *
     * @return an unmodifiable set of node ids
     */
    public Set<Long> getAllNodeIds() {
        return Collections.unmodifiableSet(nodes.keySet());
    }
}
