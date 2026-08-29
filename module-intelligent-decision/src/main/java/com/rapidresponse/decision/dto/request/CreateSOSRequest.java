package com.rapidresponse.decision.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request payload to create / submit a new emergency SOS request.
 */
public class CreateSOSRequest {

    private Long id;

    @NotNull(message = "campId is required")
    private Long campId;

    @NotBlank(message = "campName is required")
    private String campName;

    @Min(value = 1, message = "injurySeverity must be at least 1 (mild)")
    @Max(value = 10, message = "injurySeverity must be at most 10 (critical)")
    private double injurySeverity;

    @Positive(message = "population must be greater than 0")
    private double population;

    @Min(value = 0, message = "supplyShortage cannot be negative")
    @Max(value = 100, message = "supplyShortage percentage cannot exceed 100")
    private double supplyShortage;

    @Positive(message = "requiredTrucks must be greater than 0")
    private double requiredTrucks;

    public CreateSOSRequest() {
    }

    public CreateSOSRequest(Long id, Long campId, String campName, double injurySeverity,
                            double population, double supplyShortage, double requiredTrucks) {
        this.id = id;
        this.campId = campId;
        this.campName = campName;
        this.injurySeverity = injurySeverity;
        this.population = population;
        this.supplyShortage = supplyShortage;
        this.requiredTrucks = requiredTrucks;
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

        public Builder id(Long v) { this.id = v; return this; }
        public Builder campId(Long v) { this.campId = v; return this; }
        public Builder campName(String v) { this.campName = v; return this; }
        public Builder injurySeverity(double v) { this.injurySeverity = v; return this; }
        public Builder population(double v) { this.population = v; return this; }
        public Builder supplyShortage(double v) { this.supplyShortage = v; return this; }
        public Builder requiredTrucks(double v) { this.requiredTrucks = v; return this; }

        public CreateSOSRequest build() {
            return new CreateSOSRequest(id, campId, campName, injurySeverity, population, supplyShortage, requiredTrucks);
        }
    }
}
