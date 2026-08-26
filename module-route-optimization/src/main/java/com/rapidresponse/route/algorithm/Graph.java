package com.rapidresponse.route.algorithm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Graph {
    private Map<Long, Node> nodes = new HashMap<>();
    private Map<Long, List<Edge>> adjacencyList = new HashMap<>();

    public void addNode(Node node) {
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    public void addEdge(Long sourceId, Edge edge) {
        adjacencyList.putIfAbsent(sourceId, new ArrayList<>());
        adjacencyList.get(sourceId).add(edge);
        
        // Ensure target exists in adjacency list even if no outgoing edges
        adjacencyList.putIfAbsent(edge.getTargetId(), new ArrayList<>());
        
        // Ensure source node exists in nodes map if not explicitly added
        if (!nodes.containsKey(sourceId)) {
            nodes.put(sourceId, new Node(sourceId));
        }
        if (!nodes.containsKey(edge.getTargetId())) {
            nodes.put(edge.getTargetId(), new Node(edge.getTargetId()));
        }
    }

    public Node getNode(Long id) {
        return nodes.get(id);
    }

    public List<Edge> getEdges(Long nodeId) {
        return adjacencyList.getOrDefault(nodeId, new ArrayList<>());
    }

    public Map<Long, Node> getNodes() {
        return nodes;
    }
}
