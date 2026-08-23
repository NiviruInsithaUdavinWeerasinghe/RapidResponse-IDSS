package com.rapidresponse.resource.model;

import com.rapidresponse.shared.algorithm.Selectable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ReliefItem implements Selectable {

    private Long id;
    private String name;
    private double weightKg;
    private double priorityValue;

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
