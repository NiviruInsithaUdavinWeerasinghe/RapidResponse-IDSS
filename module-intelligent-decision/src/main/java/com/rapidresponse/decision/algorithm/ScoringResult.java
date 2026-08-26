package com.rapidresponse.decision.algorithm;

import java.util.List;

public class ScoringResult {

    private List<ScoredRequest> rankedRequests;
    private List<ScoredRequest> selectedRequests;
    private double totalScoreAchieved;
    private double totalCostUsed;
    private long executionTimeNanos;

    public ScoringResult() {
    }

    public ScoringResult(
            List<ScoredRequest> rankedRequests,
            List<ScoredRequest> selectedRequests,
            double totalScoreAchieved,
            double totalCostUsed,
            long executionTimeNanos
    ) {
        this.rankedRequests = rankedRequests;
        this.selectedRequests = selectedRequests;
        this.totalScoreAchieved = totalScoreAchieved;
        this.totalCostUsed = totalCostUsed;
        this.executionTimeNanos = executionTimeNanos;
    }

    public List<ScoredRequest> getRankedRequests() {
        return rankedRequests;
    }

    public void setRankedRequests(List<ScoredRequest> rankedRequests) {
        this.rankedRequests = rankedRequests;
    }

    public List<ScoredRequest> getSelectedRequests() {
        return selectedRequests;
    }

    public void setSelectedRequests(List<ScoredRequest> selectedRequests) {
        this.selectedRequests = selectedRequests;
    }

    public double getTotalScoreAchieved() {
        return totalScoreAchieved;
    }

    public void setTotalScoreAchieved(double totalScoreAchieved) {
        this.totalScoreAchieved = totalScoreAchieved;
    }

    public double getTotalCostUsed() {
        return totalCostUsed;
    }

    public void setTotalCostUsed(double totalCostUsed) {
        this.totalCostUsed = totalCostUsed;
    }

    public long getExecutionTimeNanos() {
        return executionTimeNanos;
    }

    public void setExecutionTimeNanos(long executionTimeNanos) {
        this.executionTimeNanos = executionTimeNanos;
    }
}