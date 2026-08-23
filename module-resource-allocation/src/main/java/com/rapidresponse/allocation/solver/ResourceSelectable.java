package com.rapidresponse.allocation.solver;

import com.rapidresponse.allocation.entity.ResourceEntity;
import com.rapidresponse.shared.algorithm.Selectable;

public record ResourceSelectable(ResourceEntity resource) implements Selectable {

    @Override
    public double getValue() {
        return resource.getValue();
    }

    @Override
    public double getWeight() {
        return resource.getWeight();
    }

    @Override
    public String getLabel() {
        return resource.getName();
    }
}
