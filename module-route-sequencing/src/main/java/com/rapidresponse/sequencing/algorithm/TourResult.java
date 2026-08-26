package com.rapidresponse.sequencing.algorithm;

import java.util.List;

/**
 * Result container for TSP tour solvers (Held-Karp exact and 2-opt heuristic).
 *
 * <p>The {@code tourSequence} is a list of node indices (0-based) representing the
 * visit order, including the return leg back to the depot. For example, a 3-stop tour
 * starting at depot (index 0) looks like: {@code [0, 2, 1, 0]}.
 */
public class TourResult {

    private List<Integer> tourSequence;
    private double totalDistance;
    private int problemSize;
    private long executionTimeNanos;
    private long memoryUsedBytes;

    public TourResult() {
    }

    public TourResult(List<Integer> tourSequence, double totalDistance, int problemSize, long executionTimeNanos, long memoryUsedBytes) {
        this.tourSequence = tourSequence;
        this.totalDistance = totalDistance;
        this.problemSize = problemSize;
        this.executionTimeNanos = executionTimeNanos;
        this.memoryUsedBytes = memoryUsedBytes;
    }

    public static Builder builder() {
        return new Builder();
    }

    public List<Integer> getTourSequence() {
        return tourSequence;
    }

    public void setTourSequence(List<Integer> tourSequence) {
        this.tourSequence = tourSequence;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public int getProblemSize() {
        return problemSize;
    }

    public void setProblemSize(int problemSize) {
        this.problemSize = problemSize;
    }

    public long getExecutionTimeNanos() {
        return executionTimeNanos;
    }

    public void setExecutionTimeNanos(long executionTimeNanos) {
        this.executionTimeNanos = executionTimeNanos;
    }

    public long getMemoryUsedBytes() {
        return memoryUsedBytes;
    }

    public void setMemoryUsedBytes(long memoryUsedBytes) {
        this.memoryUsedBytes = memoryUsedBytes;
    }

    public static class Builder {
        private List<Integer> tourSequence;
        private double totalDistance;
        private int problemSize;
        private long executionTimeNanos;
        private long memoryUsedBytes;

        public Builder tourSequence(List<Integer> tourSequence) {
            this.tourSequence = tourSequence;
            return this;
        }

        public Builder totalDistance(double totalDistance) {
            this.totalDistance = totalDistance;
            return this;
        }

        public Builder problemSize(int problemSize) {
            this.problemSize = problemSize;
            return this;
        }

        public Builder executionTimeNanos(long executionTimeNanos) {
            this.executionTimeNanos = executionTimeNanos;
            return this;
        }

        public Builder memoryUsedBytes(long memoryUsedBytes) {
            this.memoryUsedBytes = memoryUsedBytes;
            return this;
        }

        public TourResult build() {
            return new TourResult(tourSequence, totalDistance, problemSize, executionTimeNanos, memoryUsedBytes);
        }
    }
}
