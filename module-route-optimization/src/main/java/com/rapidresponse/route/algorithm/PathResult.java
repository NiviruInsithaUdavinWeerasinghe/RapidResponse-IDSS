package com.rapidresponse.route.algorithm;

import java.util.List;

public class PathResult {
    public static final PathResult NO_PATH_FOUND = new PathResult(List.of(), 0.0, 0.0, 0, 0);

    private List<Long> nodeSequence;
    private double totalDistanceKm;
    private double totalTravelTimeMins;
    private int nodesExplored;
    private long executionTimeNanos;

    public PathResult(List<Long> nodeSequence, double totalDistanceKm, double totalTravelTimeMins, int nodesExplored, long executionTimeNanos) {
        this.nodeSequence = nodeSequence;
        this.totalDistanceKm = totalDistanceKm;
        this.totalTravelTimeMins = totalTravelTimeMins;
        this.nodesExplored = nodesExplored;
        this.executionTimeNanos = executionTimeNanos;
    }

    public List<Long> getNodeSequence() { return nodeSequence; }
    public void setNodeSequence(List<Long> nodeSequence) { this.nodeSequence = nodeSequence; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public double getTotalTravelTimeMins() { return totalTravelTimeMins; }
    public void setTotalTravelTimeMins(double totalTravelTimeMins) { this.totalTravelTimeMins = totalTravelTimeMins; }

    public int getNodesExplored() { return nodesExplored; }
    public void setNodesExplored(int nodesExplored) { this.nodesExplored = nodesExplored; }

    public long getExecutionTimeNanos() { return executionTimeNanos; }
    public void setExecutionTimeNanos(long executionTimeNanos) { this.executionTimeNanos = executionTimeNanos; }
}
