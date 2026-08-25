package com.rapidresponse.decision.entity;

import com.rapidresponse.decision.model.SOSStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_requests")
public class SOSRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rescueCampId;

    private String campName;

    private int injurySeverity;

    private int campPopulation;

    private int supplyShortageLevel;

    private double resourceCost;

    @Enumerated(EnumType.STRING)
    private SOSStatus status;

    private LocalDateTime receivedAt;

    public SOSRequestEntity() {
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
}