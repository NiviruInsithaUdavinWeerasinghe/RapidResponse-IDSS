package com.rapidresponse.decision.dto.response;

import java.util.List;

/**
 * Result payload containing the chosen SOS requests, aggregate score, and exploration telemetry.
 */
public class DecisionResultResponse {
    private String algorithm;
    private List<SOSRequestResponse> selectedRequests;
    private double totalScore;
    private double totalCapacityUsed;
    private double maxDailyCapacity;
    private int totalSelectedCount;
    private int nodesExplored;
    private int nodesPruned;
    private long executionTimeNanos;
    private String executionTimeFormatted;

    public DecisionResultResponse() {
    }

    public DecisionResultResponse(String algorithm, List<SOSRequestResponse> selectedRequests,
                                  double totalScore, double totalCapacityUsed, double maxDailyCapacity,
                                  int totalSelectedCount, int nodesExplored, int nodesPruned,
                                  long executionTimeNanos, String executionTimeFormatted) {
        this.algorithm = algorithm;
        this.selectedRequests = selectedRequests;
        this.totalScore = totalScore;
        this.totalCapacityUsed = totalCapacityUsed;
        this.maxDailyCapacity = maxDailyCapacity;
        this.totalSelectedCount = totalSelectedCount;
        this.nodesExplored = nodesExplored;
        this.nodesPruned = nodesPruned;
        this.executionTimeNanos = executionTimeNanos;
        this.executionTimeFormatted = executionTimeFormatted;
    }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public List<SOSRequestResponse> getSelectedRequests() { return selectedRequests; }
    public void setSelectedRequests(List<SOSRequestResponse> selectedRequests) { this.selectedRequests = selectedRequests; }

    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }

    public double getTotalCapacityUsed() { return totalCapacityUsed; }
    public void setTotalCapacityUsed(double totalCapacityUsed) { this.totalCapacityUsed = totalCapacityUsed; }

    public double getMaxDailyCapacity() { return maxDailyCapacity; }
    public void setMaxDailyCapacity(double maxDailyCapacity) { this.maxDailyCapacity = maxDailyCapacity; }

    public int getTotalSelectedCount() { return totalSelectedCount; }
    public void setTotalSelectedCount(int totalSelectedCount) { this.totalSelectedCount = totalSelectedCount; }

    public int getNodesExplored() { return nodesExplored; }
    public void setNodesExplored(int nodesExplored) { this.nodesExplored = nodesExplored; }

    public int getNodesPruned() { return nodesPruned; }
    public void setNodesPruned(int nodesPruned) { this.nodesPruned = nodesPruned; }

    public long getExecutionTimeNanos() { return executionTimeNanos; }
    public void setExecutionTimeNanos(long executionTimeNanos) { this.executionTimeNanos = executionTimeNanos; }

    public String getExecutionTimeFormatted() { return executionTimeFormatted; }
    public void setExecutionTimeFormatted(String executionTimeFormatted) { this.executionTimeFormatted = executionTimeFormatted; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String algorithm;
        private List<SOSRequestResponse> selectedRequests;
        private double totalScore;
        private double totalCapacityUsed;
        private double maxDailyCapacity;
        private int totalSelectedCount;
        private int nodesExplored;
        private int nodesPruned;
        private long executionTimeNanos;
        private String executionTimeFormatted;

        public Builder algorithm(String v) { this.algorithm = v; return this; }
        public Builder selectedRequests(List<SOSRequestResponse> v) { this.selectedRequests = v; return this; }
        public Builder totalScore(double v) { this.totalScore = v; return this; }
        public Builder totalCapacityUsed(double v) { this.totalCapacityUsed = v; return this; }
        public Builder maxDailyCapacity(double v) { this.maxDailyCapacity = v; return this; }
        public Builder totalSelectedCount(int v) { this.totalSelectedCount = v; return this; }
        public Builder nodesExplored(int v) { this.nodesExplored = v; return this; }
        public Builder nodesPruned(int v) { this.nodesPruned = v; return this; }
        public Builder executionTimeNanos(long v) { this.executionTimeNanos = v; return this; }
        public Builder executionTimeFormatted(String v) { this.executionTimeFormatted = v; return this; }

        public DecisionResultResponse build() {
            return new DecisionResultResponse(algorithm, selectedRequests, totalScore, totalCapacityUsed,
                    maxDailyCapacity, totalSelectedCount, nodesExplored, nodesPruned, executionTimeNanos, executionTimeFormatted);
        }
    }
}
