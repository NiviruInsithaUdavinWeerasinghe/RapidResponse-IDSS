package com.rapidresponse.decision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * JPA Entity representing an emergency SOS rescue request from a disaster-affected camp.
 */
@Entity
@Table(name = "sos_requests")
public class SOSRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rescue_camp_id", nullable = false)
    private Long campId;

    @Column(name = "camp_name", nullable = false)
    private String campName;

    @Column(name = "injury_severity", nullable = false)
    private double injurySeverity; // 1.0 (mild) to 10.0 (critical)

    @Column(name = "camp_population", nullable = false)
    private double population; // affected population

    @Column(name = "supply_shortage_level", nullable = false)
    private double supplyShortage; // 0.0% to 100.0%

    @Column(name = "resource_cost", nullable = false)
    private double requiredTrucks; // required vehicles / capacity

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SOSStatus status;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    public SOSRequestEntity() {
    }

    public SOSRequestEntity(Long id, Long campId, String campName, double injurySeverity,
                            double population, double supplyShortage, double requiredTrucks,
                            SOSStatus status, LocalDateTime receivedAt) {
        this.id = id;
        this.campId = campId;
        this.campName = campName;
        this.injurySeverity = injurySeverity;
        this.population = population;
        this.supplyShortage = supplyShortage;
        this.requiredTrucks = requiredTrucks;
        this.status = status;
        this.receivedAt = receivedAt;
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
        private SOSStatus status = SOSStatus.PENDING;
        private LocalDateTime receivedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder campId(Long campId) { this.campId = campId; return this; }
        public Builder campName(String campName) { this.campName = campName; return this; }
        public Builder injurySeverity(double injurySeverity) { this.injurySeverity = injurySeverity; return this; }
        public Builder population(double population) { this.population = population; return this; }
        public Builder supplyShortage(double supplyShortage) { this.supplyShortage = supplyShortage; return this; }
        public Builder requiredTrucks(double requiredTrucks) { this.requiredTrucks = requiredTrucks; return this; }
        public Builder status(SOSStatus status) { this.status = status; return this; }
        public Builder receivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; return this; }

        public SOSRequestEntity build() {
            return new SOSRequestEntity(id, campId, campName, injurySeverity, population, supplyShortage, requiredTrucks, status, receivedAt);
        }
    }
}
