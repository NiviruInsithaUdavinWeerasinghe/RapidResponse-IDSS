package com.rapidresponse.route.model;

/**
 * Represents a directed edge (road segment) in the disaster-zone road network graph.
 */
public class Edge {

    private final Long sourceId;
    private final Long targetId;
    private final double distanceKm;
    private final double travelTimeMins;
    private boolean isBlocked;

    public Edge(Long sourceId, Long targetId, double distanceKm, double travelTimeMins) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.distanceKm = distanceKm;
        this.travelTimeMins = travelTimeMins;
        this.isBlocked = false;
    }

    public Edge(Long sourceId, Long targetId, double distanceKm, double travelTimeMins, boolean isBlocked) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.distanceKm = distanceKm;
        this.travelTimeMins = travelTimeMins;
        this.isBlocked = isBlocked;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public Long getTargetId() {
        return targetId;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getTravelTimeMins() {
        return travelTimeMins;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        this.isBlocked = blocked;
    }

    @Override
    public String toString() {
        return "Edge{" + sourceId + " -> " + targetId +
                ", dist=" + distanceKm + "km" +
                ", time=" + travelTimeMins + "min" +
                (isBlocked ? ", BLOCKED" : "") + "}";
    }
}
