package com.rapidresponse.shared.algorithm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result container for subset selection algorithms (e.g. Branch & Bound, Greedy).
 *
 * @param <T> type of selectable items
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubsetResult<T> {
    private List<T> selectedItems;
    private double totalValue;
    private double totalWeight;
    private double capacityUsed;
    private int nodesExplored;        // B&B tree nodes explored
    private int nodesPruned;          // branches pruned
    private long executionTimeNanos;
}
