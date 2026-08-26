package com.rapidresponse.resource.model;

import com.rapidresponse.shared.algorithm.Selectable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReliefItem implements Selectable {

    private Long id;
    private String name;
    private double weightKg;
    private double priorityValue;

    public ReliefItem() {
    }

    public ReliefItem(Long id, String name, double weightKg, double priorityValue) {
        this.id = id;
        this.name = name;
        this.weightKg = weightKg;
        this.priorityValue = priorityValue;
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

    @Override
    public double getValue() {
        return priorityValue;
    }

    @Override
    public double getWeight() {
        return weightKg;
    }

    @Override
    public String getLabel() {
        return name;
    }
}
