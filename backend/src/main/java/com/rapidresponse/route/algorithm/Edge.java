package com.rapidresponse.route.algorithm;

import java.util.Objects;

public final class Edge {
    private final Node destination;
    private final double distance;
    private final double travelTime;
    private final boolean blocked;

    public Edge(Node destination, double distance, double travelTime, boolean blocked) {
        this.destination = Objects.requireNonNull(destination);
        this.distance = distance;
        this.travelTime = travelTime;
        this.blocked = blocked;
    }

    public Node getDestination() {
        return destination;
    }

    public double getDistance() {
        return distance;
    }

    public double getTravelTime() {
        return travelTime;
    }

    public boolean isBlocked() {
        return blocked;
    }
}