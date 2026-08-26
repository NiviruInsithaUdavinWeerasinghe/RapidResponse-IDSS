package com.rapidresponse.shared.algorithm;

import java.util.List;

/**
 * Result container for subset selection algorithms (e.g. Branch & Bound, Greedy).
 *
 * @param <T> type of selectable items
 */
public class SubsetResult<T> {
    private List<T> selectedItems;
    private double totalValue;
    private double totalWeight;
    private double capacityUsed;
    private int nodesExplored;        // B&B tree nodes explored
    private int nodesPruned;          // branches pruned
    private long executionTimeNanos;

    public SubsetResult() {
    }

    public SubsetResult(List<T> selectedItems, double totalValue, double totalWeight,
                        double capacityUsed, int nodesExplored, int nodesPruned, long executionTimeNanos) {
        this.selectedItems = selectedItems;
        this.totalValue = totalValue;
        this.totalWeight = totalWeight;
        this.capacityUsed = capacityUsed;
        this.nodesExplored = nodesExplored;
        this.nodesPruned = nodesPruned;
        this.executionTimeNanos = executionTimeNanos;
    }

    public List<T> getSelectedItems() {
        return selectedItems;
    }

    public void setSelectedItems(List<T> selectedItems) {
        this.selectedItems = selectedItems;
    }

    public double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(double totalValue) {
        this.totalValue = totalValue;
    }

    public double getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(double totalWeight) {
        this.totalWeight = totalWeight;
    }

    public double getCapacityUsed() {
        return capacityUsed;
    }

    public void setCapacityUsed(double capacityUsed) {
        this.capacityUsed = capacityUsed;
    }

    public int getNodesExplored() {
        return nodesExplored;
    }

    public void setNodesExplored(int nodesExplored) {
        this.nodesExplored = nodesExplored;
    }

    public int getNodesPruned() {
        return nodesPruned;
    }

    public void setNodesPruned(int nodesPruned) {
        this.nodesPruned = nodesPruned;
    }

    public long getExecutionTimeNanos() {
        return executionTimeNanos;
    }

    public void setExecutionTimeNanos(long executionTimeNanos) {
        this.executionTimeNanos = executionTimeNanos;
    }

    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private List<T> selectedItems;
        private double totalValue;
        private double totalWeight;
        private double capacityUsed;
        private int nodesExplored;
        private int nodesPruned;
        private long executionTimeNanos;

        public Builder<T> selectedItems(List<T> selectedItems) {
            this.selectedItems = selectedItems;
            return this;
        }

        public Builder<T> totalValue(double totalValue) {
            this.totalValue = totalValue;
            return this;
        }

        public Builder<T> totalWeight(double totalWeight) {
            this.totalWeight = totalWeight;
            return this;
        }

        public Builder<T> capacityUsed(double capacityUsed) {
            this.capacityUsed = capacityUsed;
            return this;
        }

        public Builder<T> nodesExplored(int nodesExplored) {
            this.nodesExplored = nodesExplored;
            return this;
        }

        public Builder<T> nodesPruned(int nodesPruned) {
            this.nodesPruned = nodesPruned;
            return this;
        }

        public Builder<T> executionTimeNanos(long executionTimeNanos) {
            this.executionTimeNanos = executionTimeNanos;
            return this;
        }

        public SubsetResult<T> build() {
            return new SubsetResult<>(selectedItems, totalValue, totalWeight,
                    capacityUsed, nodesExplored, nodesPruned, executionTimeNanos);
        }
    }
}
