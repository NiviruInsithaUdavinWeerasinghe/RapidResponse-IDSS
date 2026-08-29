package com.rapidresponse.decision.dto.response;

/**
 * Side-by-side comparison between Exact (Branch & Bound) and Heuristic (Weighted Scoring).
 */
public class DecisionCompareResponse {
    private DecisionResultResponse exact;
    private DecisionResultResponse heuristic;
    private double heuristicRatio; // heuristicScore / exactScore
    private double scoreDifference; // exactScore - heuristicScore
    private String timeSavings; // e.g. "4.82 ms"
    private long timeSavingsNanos;
    private double speedupFactor; // exactTime / heuristicTime
    private int nodesPrunedByBranchAndBound;
    private int nodesExploredByBranchAndBound;

    public DecisionCompareResponse() {
    }

    public DecisionCompareResponse(DecisionResultResponse exact, DecisionResultResponse heuristic,
                                   double heuristicRatio, double scoreDifference, String timeSavings,
                                   long timeSavingsNanos, double speedupFactor,
                                   int nodesPrunedByBranchAndBound, int nodesExploredByBranchAndBound) {
        this.exact = exact;
        this.heuristic = heuristic;
        this.heuristicRatio = heuristicRatio;
        this.scoreDifference = scoreDifference;
        this.timeSavings = timeSavings;
        this.timeSavingsNanos = timeSavingsNanos;
        this.speedupFactor = speedupFactor;
        this.nodesPrunedByBranchAndBound = nodesPrunedByBranchAndBound;
        this.nodesExploredByBranchAndBound = nodesExploredByBranchAndBound;
    }

    public DecisionResultResponse getExact() { return exact; }
    public void setExact(DecisionResultResponse exact) { this.exact = exact; }

    public DecisionResultResponse getHeuristic() { return heuristic; }
    public void setHeuristic(DecisionResultResponse heuristic) { this.heuristic = heuristic; }

    public double getHeuristicRatio() { return heuristicRatio; }
    public void setHeuristicRatio(double heuristicRatio) { this.heuristicRatio = heuristicRatio; }

    public double getScoreDifference() { return scoreDifference; }
    public void setScoreDifference(double scoreDifference) { this.scoreDifference = scoreDifference; }

    public String getTimeSavings() { return timeSavings; }
    public void setTimeSavings(String timeSavings) { this.timeSavings = timeSavings; }

    public long getTimeSavingsNanos() { return timeSavingsNanos; }
    public void setTimeSavingsNanos(long timeSavingsNanos) { this.timeSavingsNanos = timeSavingsNanos; }

    public double getSpeedupFactor() { return speedupFactor; }
    public void setSpeedupFactor(double speedupFactor) { this.speedupFactor = speedupFactor; }

    public int getNodesPrunedByBranchAndBound() { return nodesPrunedByBranchAndBound; }
    public void setNodesPrunedByBranchAndBound(int v) { this.nodesPrunedByBranchAndBound = v; }

    public int getNodesExploredByBranchAndBound() { return nodesExploredByBranchAndBound; }
    public void setNodesExploredByBranchAndBound(int v) { this.nodesExploredByBranchAndBound = v; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private DecisionResultResponse exact;
        private DecisionResultResponse heuristic;
        private double heuristicRatio;
        private double scoreDifference;
        private String timeSavings;
        private long timeSavingsNanos;
        private double speedupFactor;
        private int nodesPrunedByBranchAndBound;
        private int nodesExploredByBranchAndBound;

        public Builder exact(DecisionResultResponse v) { this.exact = v; return this; }
        public Builder heuristic(DecisionResultResponse v) { this.heuristic = v; return this; }
        public Builder heuristicRatio(double v) { this.heuristicRatio = v; return this; }
        public Builder scoreDifference(double v) { this.scoreDifference = v; return this; }
        public Builder timeSavings(String v) { this.timeSavings = v; return this; }
        public Builder timeSavingsNanos(long v) { this.timeSavingsNanos = v; return this; }
        public Builder speedupFactor(double v) { this.speedupFactor = v; return this; }
        public Builder nodesPrunedByBranchAndBound(int v) { this.nodesPrunedByBranchAndBound = v; return this; }
        public Builder nodesExploredByBranchAndBound(int v) { this.nodesExploredByBranchAndBound = v; return this; }

        public DecisionCompareResponse build() {
            return new DecisionCompareResponse(exact, heuristic, heuristicRatio, scoreDifference,
                    timeSavings, timeSavingsNanos, speedupFactor, nodesPrunedByBranchAndBound, nodesExploredByBranchAndBound);
        }
    }
}
