package com.rapidresponse.route.algorithm;

import java.util.Collections;
import java.util.List;

public final class PathResult {
    private final String status;
    private final List<String> path;
    private final double totalDistance;
    private final double totalTravelTime;
    private final int nodesExplored;
    private final long executionTimeNanos;

    public PathResult(String status, List<String> path, double totalDistance,
                      double totalTravelTime, int nodesExplored, long executionTimeNanos) {
        this.status = status;
        this.path = List.copyOf(path);
        this.totalDistance = totalDistance;
        this.totalTravelTime = totalTravelTime;
        this.nodesExplored = nodesExplored;
        this.executionTimeNanos = executionTimeNanos;
    }

    public String getStatus() {
        return status;
    }

    public List<String> getPath() {
        return Collections.unmodifiableList(path);
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public double getTotalTravelTime() {
        return totalTravelTime;
    }

    public int getNodesExplored() {
        return nodesExplored;
    }

    public long getExecutionTimeNanos() {
        return executionTimeNanos;
    }
}