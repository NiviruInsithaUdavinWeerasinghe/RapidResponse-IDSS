package com.rapidresponse.decision.algorithm;

public class ScoredRequest {

    private Long requestId;
    private String campName;
    private double rawScore;
    private double normalizedScore;
    private double resourceCost;

    public ScoredRequest() {
    }

    public ScoredRequest(
            Long requestId,
            String campName,
            double rawScore,
            double normalizedScore,
            double resourceCost
    ) {
        this.requestId = requestId;
        this.campName = campName;
        this.rawScore = rawScore;
        this.normalizedScore = normalizedScore;
        this.resourceCost = resourceCost;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getCampName() {
        return campName;
    }

    public void setCampName(String campName) {
        this.campName = campName;
    }

    public double getRawScore() {
        return rawScore;
    }

    public void setRawScore(double rawScore) {
        this.rawScore = rawScore;
    }

    public double getNormalizedScore() {
        return normalizedScore;
    }

    public void setNormalizedScore(double normalizedScore) {
        this.normalizedScore = normalizedScore;
    }

    public double getResourceCost() {
        return resourceCost;
    }

    public void setResourceCost(double resourceCost) {
        this.resourceCost = resourceCost;
    }
}