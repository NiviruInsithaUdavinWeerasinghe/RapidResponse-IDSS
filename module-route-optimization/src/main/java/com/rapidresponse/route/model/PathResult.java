package com.rapidresponse.route.model;

import java.util.Collections;
import java.util.List;

/**
 * Result container for Module 1 pathfinders (Dijkstra and A*).
 */
public class PathResult {

    public static final String STATUS_SUCCESS = "SUCCESS";
    public static final String STATUS_NO_PATH = "NO_PATH_FOUND";

    private String status = STATUS_SUCCESS;
    private List<Long> nodeSequence;
    private double totalDistanceKm;
    private double totalTravelTimeMins;
    private int nodesExplored;
    private long executionTimeNanos;

    public PathResult() {
    }

    public PathResult(String status, List<Long> nodeSequence, double totalDistanceKm,
                      double totalTravelTimeMins, int nodesExplored, long executionTimeNanos) {
        this.status = status;
        this.nodeSequence = nodeSequence;
        this.totalDistanceKm = totalDistanceKm;
        this.totalTravelTimeMins = totalTravelTimeMins;
        this.nodesExplored = nodesExplored;
        this.executionTimeNanos = executionTimeNanos;
    }

    public String getStatus() {
        return status;
    }

    public List<Long> getNodeSequence() {
        return nodeSequence;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public double getTotalTravelTimeMins() {
        return totalTravelTimeMins;
    }

    public int getNodesExplored() {
        return nodesExplored;
    }

    public long getExecutionTimeNanos() {
        return executionTimeNanos;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String status = STATUS_SUCCESS;
        private List<Long> nodeSequence;
        private double totalDistanceKm;
        private double totalTravelTimeMins;
        private int nodesExplored;
        private long executionTimeNanos;

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder nodeSequence(List<Long> nodeSequence) {
            this.nodeSequence = nodeSequence;
            return this;
        }

        public Builder totalDistanceKm(double totalDistanceKm) {
            this.totalDistanceKm = totalDistanceKm;
            return this;
        }

        public Builder totalTravelTimeMins(double totalTravelTimeMins) {
            this.totalTravelTimeMins = totalTravelTimeMins;
            return this;
        }

        public Builder nodesExplored(int nodesExplored) {
            this.nodesExplored = nodesExplored;
            return this;
        }

        public Builder executionTimeNanos(long executionTimeNanos) {
            this.executionTimeNanos = executionTimeNanos;
            return this;
        }

        public PathResult build() {
            return new PathResult(status, nodeSequence, totalDistanceKm,
                    totalTravelTimeMins, nodesExplored, executionTimeNanos);
        }
    }

    public static PathResult success(List<Long> nodeSequence, double totalDistanceKm,
                                     double totalTravelTimeMins, int nodesExplored,
                                     long executionTimeNanos) {
        return PathResult.builder()
                .status(STATUS_SUCCESS)
                .nodeSequence(List.copyOf(nodeSequence))
                .totalDistanceKm(totalDistanceKm)
                .totalTravelTimeMins(totalTravelTimeMins)
                .nodesExplored(nodesExplored)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }

    public static PathResult unreachable(int nodesExplored, long executionTimeNanos) {
        return PathResult.builder()
                .status(STATUS_NO_PATH)
                .nodeSequence(Collections.emptyList())
                .totalDistanceKm(0.0)
                .totalTravelTimeMins(0.0)
                .nodesExplored(nodesExplored)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }
}
