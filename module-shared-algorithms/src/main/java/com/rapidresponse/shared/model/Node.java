package com.rapidresponse.shared.model;

/**
 * Represents a node (location) in the disaster-zone road network graph.
 */
public class Node {

    private final Long id;
    private final String name;
    private final double latitude;
    private final double longitude;
    private final NodeType nodeType;

    public Node(Long id, String name, double latitude, double longitude, NodeType nodeType) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.nodeType = nodeType;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public NodeType getNodeType() {
        return nodeType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Node node = (Node) o;
        return id.equals(node.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "Node{id=" + id + ", name='" + name + "', type=" + nodeType + "}";
    }
}
