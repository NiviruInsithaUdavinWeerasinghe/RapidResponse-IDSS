package com.rapidresponse.resource.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "relief_items")
public class ReliefItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double weightKg;
    private double priorityValue;
    @Enumerated(EnumType.STRING)
    private ReliefCategory category;

    public ReliefItemEntity() {
    }

    public ReliefItemEntity(Long id, String name, double weightKg, double priorityValue, ReliefCategory category) {
        this.id = id;
        this.name = name;
        this.weightKg = weightKg;
        this.priorityValue = priorityValue;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(double weightKg) {
        this.weightKg = weightKg;
    }

    public double getPriorityValue() {
        return priorityValue;
    }

    public void setPriorityValue(double priorityValue) {
        this.priorityValue = priorityValue;
    }

    public ReliefCategory getCategory() {
        return category;
    }

    public void setCategory(ReliefCategory category) {
        this.category = category;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private double weightKg;
        private double priorityValue;
        private ReliefCategory category;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder weightKg(double weightKg) {
            this.weightKg = weightKg;
            return this;
        }

        public Builder priorityValue(double priorityValue) {
            this.priorityValue = priorityValue;
            return this;
        }

        public Builder category(ReliefCategory category) {
            this.category = category;
            return this;
        }

        public ReliefItemEntity build() {
            return new ReliefItemEntity(id, name, weightKg, priorityValue, category);
        }
    }
}
