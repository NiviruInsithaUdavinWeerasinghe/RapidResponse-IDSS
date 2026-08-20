package com.rapidresponse.route.entity;

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

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "distance_km", nullable = false)
    private double distanceKm;

    @Column(name = "travel_time_mins", nullable = false)
    private double travelTimeMins;

    @Column(name = "is_blocked", nullable = false)
    private boolean isBlocked;

    @Column(name = "is_undirected", nullable = false)
    private boolean isUndirected;

    public EdgeEntity() {
    }

    public EdgeEntity(Long sourceId, Long targetId, double distanceKm, double travelTimeMins,
                      boolean isBlocked, boolean isUndirected) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.distanceKm = distanceKm;
        this.travelTimeMins = travelTimeMins;
        this.isBlocked = isBlocked;
        this.isUndirected = isUndirected;
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
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        this.isBlocked = blocked;
    }

    public boolean isUndirected() {
        return isUndirected;
    }

    public void setUndirected(boolean undirected) {
        this.isUndirected = undirected;
    }
}
