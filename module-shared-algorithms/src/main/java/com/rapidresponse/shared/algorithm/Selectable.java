package com.rapidresponse.shared.algorithm;

/**
 * Represents an item that can be selected in subset selection algorithms such as
 * Branch & Bound or Greedy solvers.
 */
public interface Selectable {
    double getValue();
    double getWeight();
    String getLabel();
}
