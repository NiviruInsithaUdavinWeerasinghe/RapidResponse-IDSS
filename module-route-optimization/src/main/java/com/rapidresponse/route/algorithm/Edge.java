package com.rapidresponse.route.algorithm;

public class Edge {
    private Long targetId;
    private double distance;
    private double travelTime;
    private boolean isBlocked;

    public Edge(Long targetId, double distance, double travelTime, boolean isBlocked) {
        this.targetId = targetId;
        this.distance = distance;
        this.travelTime = travelTime;
        this.isBlocked = isBlocked;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public double getTravelTime() {
        return travelTime;
    }

    public void setTravelTime(double travelTime) {
        this.travelTime = travelTime;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        this.isBlocked = blocked;
    }
}
