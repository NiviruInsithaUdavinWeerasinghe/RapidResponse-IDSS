package com.rapidresponse.decision.model;

import com.rapidresponse.shared.algorithm.Selectable;

public class SOSRequest implements Selectable {

    private Long id;

    private String campName;

    private double compositeScore;

    private double resourceCost;

    public SOSRequest() {
    }

    @Override
    public double getValue() {
        return compositeScore;
    }

    @Override
    public double getWeight() {
        return resourceCost;
    }

    @Override
    public String getLabel() {
        return campName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCampName() {
        return campName;
    }

    public void setCampName(String campName) {
        this.campName = campName;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public void setCompositeScore(double compositeScore) {
        this.compositeScore = compositeScore;
    }

    public double getResourceCost() {
        return resourceCost;
    }

    public void setResourceCost(double resourceCost) {
        this.resourceCost = resourceCost;
    }
}