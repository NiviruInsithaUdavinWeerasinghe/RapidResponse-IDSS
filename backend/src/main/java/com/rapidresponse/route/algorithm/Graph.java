package com.rapidresponse.route.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Graph {
    private final Map<Node, List<Edge>> adjacency = new LinkedHashMap<>();

    public void addNode(Node node) {
        adjacency.computeIfAbsent(node, ignored -> new ArrayList<>());
    }

    public void addEdge(Node source, Edge edge) {
        addNode(source);
        addNode(edge.getDestination());
        adjacency.get(source).add(edge);
    }

    public List<Node> getNodes() {
        return Collections.unmodifiableList(new ArrayList<>(adjacency.keySet()));
    }

    public List<Edge> getEdges(Node source) {
        return adjacency.getOrDefault(source, Collections.emptyList());
    }
}