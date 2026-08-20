package com.rapidresponse.shared.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * JPA entity representing an edge (road segment) persisted in the database.
 */
@Entity
@Table(name = "edges")
public class EdgeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_node_id", nullable = false)
    private Long sourceId;

    @Column(name = "target_node_id", nullable = false)
    private Long targetId;

    @Column(name = "distance_km", nullable = false)
    private double distanceKm;

    @Column(name = "travel_time_mins", nullable = false)
    private double travelTimeMins;

    @Column(name = "blocked", nullable = false)
    private boolean blocked;

    @Column(name = "one_way", nullable = false)
    private boolean oneWay;

    public EdgeEntity() {
    }

    public EdgeEntity(Long sourceId, Long targetId, double distanceKm, double travelTimeMins,
                      boolean blocked, boolean oneWay) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.distanceKm = distanceKm;
        this.travelTimeMins = travelTimeMins;
        this.blocked = blocked;
        this.oneWay = oneWay;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getTravelTimeMins() {
        return travelTimeMins;
    }

    public void setTravelTimeMins(double travelTimeMins) {
        this.travelTimeMins = travelTimeMins;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public boolean isOneWay() {
        return oneWay;
    }

    public void setOneWay(boolean oneWay) {
        this.oneWay = oneWay;
    }
}
