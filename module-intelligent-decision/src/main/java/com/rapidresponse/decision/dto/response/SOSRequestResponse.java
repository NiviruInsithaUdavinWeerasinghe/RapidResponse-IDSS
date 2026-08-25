package com.rapidresponse.decision.dto.response;

import com.rapidresponse.decision.entity.SOSStatus;
import java.time.LocalDateTime;

public class SOSRequestResponse {
    private Long id;
    private Long campId;
    private String campName;
    private double injurySeverity;
    private double population;
    private double supplyShortage;
    private double requiredTrucks;
    private SOSStatus status;
    private LocalDateTime receivedAt;
    private double normalizedSeverity;
    private double normalizedPopulation;
    private double normalizedShortage;
    private double compositeScore;

    public SOSRequestResponse() {
    }

    public SOSRequestResponse(Long id, Long campId, String campName, double injurySeverity,
                              double population, double supplyShortage, double requiredTrucks,
                              SOSStatus status, LocalDateTime receivedAt, double normalizedSeverity,
                              double normalizedPopulation, double normalizedShortage, double compositeScore) {
        this.id = id;
        this.campId = campId;
        this.campName = campName;
        this.injurySeverity = injurySeverity;
        this.population = population;
        this.supplyShortage = supplyShortage;
        this.requiredTrucks = requiredTrucks;
        this.status = status;
        this.receivedAt = receivedAt;
        this.normalizedSeverity = normalizedSeverity;
        this.normalizedPopulation = normalizedPopulation;
        this.normalizedShortage = normalizedShortage;
        this.compositeScore = compositeScore;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCampId() { return campId; }
    public void setCampId(Long campId) { this.campId = campId; }

    public String getCampName() { return campName; }
    public void setCampName(String campName) { this.campName = campName; }

    public double getInjurySeverity() { return injurySeverity; }
    public void setInjurySeverity(double injurySeverity) { this.injurySeverity = injurySeverity; }

    public double getPopulation() { return population; }
    public void setPopulation(double population) { this.population = population; }

    public double getSupplyShortage() { return supplyShortage; }
    public void setSupplyShortage(double supplyShortage) { this.supplyShortage = supplyShortage; }

    public double getRequiredTrucks() { return requiredTrucks; }
    public void setRequiredTrucks(double requiredTrucks) { this.requiredTrucks = requiredTrucks; }

    public SOSStatus getStatus() { return status; }
    public void setStatus(SOSStatus status) { this.status = status; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }

    public double getNormalizedSeverity() { return normalizedSeverity; }
    public void setNormalizedSeverity(double normalizedSeverity) { this.normalizedSeverity = normalizedSeverity; }

    public double getNormalizedPopulation() { return normalizedPopulation; }
    public void setNormalizedPopulation(double normalizedPopulation) { this.normalizedPopulation = normalizedPopulation; }

    public double getNormalizedShortage() { return normalizedShortage; }
    public void setNormalizedShortage(double normalizedShortage) { this.normalizedShortage = normalizedShortage; }

    public double getCompositeScore() { return compositeScore; }
    public void setCompositeScore(double compositeScore) { this.compositeScore = compositeScore; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long campId;
        private String campName;
        private double injurySeverity;
        private double population;
        private double supplyShortage;
        private double requiredTrucks;
        private SOSStatus status;
        private LocalDateTime receivedAt;
        private double normalizedSeverity;
        private double normalizedPopulation;
        private double normalizedShortage;
        private double compositeScore;

        public Builder id(Long v) { this.id = v; return this; }
        public Builder campId(Long v) { this.campId = v; return this; }
        public Builder campName(String v) { this.campName = v; return this; }
        public Builder injurySeverity(double v) { this.injurySeverity = v; return this; }
        public Builder population(double v) { this.population = v; return this; }
        public Builder supplyShortage(double v) { this.supplyShortage = v; return this; }
        public Builder requiredTrucks(double v) { this.requiredTrucks = v; return this; }
        public Builder status(SOSStatus v) { this.status = v; return this; }
        public Builder receivedAt(LocalDateTime v) { this.receivedAt = v; return this; }
        public Builder normalizedSeverity(double v) { this.normalizedSeverity = v; return this; }
        public Builder normalizedPopulation(double v) { this.normalizedPopulation = v; return this; }
        public Builder normalizedShortage(double v) { this.normalizedShortage = v; return this; }
        public Builder compositeScore(double v) { this.compositeScore = v; return this; }

        public SOSRequestResponse build() {
            return new SOSRequestResponse(id, campId, campName, injurySeverity, population, supplyShortage, requiredTrucks,
                    status, receivedAt, normalizedSeverity, normalizedPopulation, normalizedShortage, compositeScore);
        }
    }
}
