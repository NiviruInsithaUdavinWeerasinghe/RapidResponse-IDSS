package com.rapidresponse.decision.model;

import com.rapidresponse.shared.algorithm.Selectable;

import java.time.LocalDateTime;

public class SOSRequest implements Selectable {

    private Long id;

    private Long rescueCampId;

    private String campName;

    private int injurySeverity;

    private int campPopulation;

    private int supplyShortageLevel;

    private double resourceCost;

    private SOSStatus status;

    private LocalDateTime receivedAt;

    private double compositeScore;

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

    public Long getRescueCampId() {
        return rescueCampId;
    }

    public void setRescueCampId(Long rescueCampId) {
        this.rescueCampId = rescueCampId;
    }

    public String getCampName() {
        return campName;
    }

    public void setCampName(String campName) {
        this.campName = campName;
    }

    public int getInjurySeverity() {
        return injurySeverity;
    }

    public void setInjurySeverity(int injurySeverity) {
        this.injurySeverity = injurySeverity;
    }

    public int getCampPopulation() {
        return campPopulation;
    }

    public void setCampPopulation(int campPopulation) {
        this.campPopulation = campPopulation;
    }

    public int getSupplyShortageLevel() {
        return supplyShortageLevel;
    }

    public void setSupplyShortageLevel(int supplyShortageLevel) {
        this.supplyShortageLevel = supplyShortageLevel;
    }

    public double getResourceCost() {
        return resourceCost;
    }

    public void setResourceCost(double resourceCost) {
        this.resourceCost = resourceCost;
    }

    public SOSStatus getStatus() {
        return status;
    }

    public void setStatus(SOSStatus status) {
        this.status = status;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public void setCompositeScore(double compositeScore) {
        this.compositeScore = compositeScore;
    }
}