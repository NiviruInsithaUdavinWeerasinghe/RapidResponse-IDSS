package com.rapidresponse.shared.algorithm;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Shared, generic Branch & Bound subset selection engine.
 * Solves the 0-1 Knapsack / Subset Selection problem optimally using best-first search
 * guided by fractional-relaxation upper bounds.
 *
 * @param <T> type of selectable items
 */
public class BranchAndBoundSolver<T extends Selectable> {

    private static class Node {
        int level;
        double value;
        double weight;
        double upperBound;
        boolean[] selection;
    }

    /**
     * Solves the subset selection problem for the given items and capacity.
     *
     * @param items list of selectable items
     * @param capacity maximum allowable total weight
     * @return SubsetResult containing the optimal selection and performance metrics
     */
    public SubsetResult<T> solve(List<T> items, double capacity) {
        long startTime = System.nanoTime();

        if (items == null || items.isEmpty() || capacity <= 0) {
            return SubsetResult.<T>builder()
                    .selectedItems(Collections.emptyList())
                    .totalValue(0.0)
                    .totalWeight(0.0)
                    .capacityUsed(0.0)
                    .nodesExplored(0)
                    .nodesPruned(0)
                    .executionTimeNanos(System.nanoTime() - startTime)
                    .build();
        }

        int n = items.size();
        List<T> sortedItems = new ArrayList<>(items);
        // Pre-sort items by value/weight ratio descending
        sortedItems.sort(Comparator.comparingDouble(this::getRatio).reversed());

        int nodesExplored = 0;
        int nodesPruned = 0;

        double bestValue = 0.0;
        boolean[] bestSelection = new boolean[n];

        // Max-heap priority queue keyed by upperBound for best-first search
        PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> Double.compare(b.upperBound, a.upperBound));

        Node root = new Node();
        root.level = 0;
        root.value = 0.0;
        root.weight = 0.0;
        root.selection = new boolean[n];
        root.upperBound = computeUpperBound(sortedItems, capacity, 0, 0.0, 0.0);

        pq.add(root);

        while (!pq.isEmpty()) {
            Node node = pq.poll();
            nodesExplored++;

            // Prune: skip if upper bound cannot exceed best value found so far
            if (node.upperBound <= bestValue + 1e-9) {
                nodesPruned++;
                continue;
            }

            if (node.level == n) {
                if (node.value > bestValue) {
                    bestValue = node.value;
                    bestSelection = node.selection;
                }
                continue;
            }

            int level = node.level;
            T currentItem = sortedItems.get(level);

            // Branch 1: Include item (only if weight + item.weight <= capacity)
            if (node.weight + currentItem.getWeight() <= capacity + 1e-9) {
                double incWeight = node.weight + currentItem.getWeight();
                double incValue = node.value + currentItem.getValue();
                boolean[] incSelection = Arrays.copyOf(node.selection, n);
                incSelection[level] = true;

                if (incValue > bestValue) {
                    bestValue = incValue;
                    bestSelection = incSelection;
                }

                double incBound = computeUpperBound(sortedItems, capacity, level + 1, incWeight, incValue);
                if (incBound > bestValue + 1e-9) {
                    Node incNode = new Node();
                    incNode.level = level + 1;
                    incNode.value = incValue;
                    incNode.weight = incWeight;
                    incNode.upperBound = incBound;
                    incNode.selection = incSelection;
                    pq.add(incNode);
                } else {
                    nodesPruned++;
                }
            }

            // Branch 2: Exclude item
            double excWeight = node.weight;
            double excValue = node.value;
            boolean[] excSelection = Arrays.copyOf(node.selection, n);
            excSelection[level] = false;

            double excBound = computeUpperBound(sortedItems, capacity, level + 1, excWeight, excValue);
            if (excBound > bestValue + 1e-9) {
                Node excNode = new Node();
                excNode.level = level + 1;
                excNode.value = excValue;
                excNode.weight = excWeight;
                excNode.upperBound = excBound;
                excNode.selection = excSelection;
                pq.add(excNode);
            } else {
                nodesPruned++;
            }
        }

        // Construct optimal item selection list
        List<T> selectedItems = new ArrayList<>();
        double totalValue = 0.0;
        double totalWeight = 0.0;

        for (int i = 0; i < n; i++) {
            if (bestSelection[i]) {
                T item = sortedItems.get(i);
                selectedItems.add(item);
                totalValue += item.getValue();
                totalWeight += item.getWeight();
            }
        }

        long executionTimeNanos = System.nanoTime() - startTime;

        return SubsetResult.<T>builder()
                .selectedItems(selectedItems)
                .totalValue(totalValue)
                .totalWeight(totalWeight)
                .capacityUsed(totalWeight)
                .nodesExplored(nodesExplored)
                .nodesPruned(nodesPruned)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }

    /**
     * Computes the fractional-knapsack upper bound starting from current level.
     */
    private double computeUpperBound(List<T> items, double capacity, int level, double currentWeight, double currentValue) {
        if (currentWeight > capacity) {
            return 0.0;
        }

        double bound = currentValue;
        double remainingCapacity = capacity - currentWeight;
        int n = items.size();

        for (int i = level; i < n; i++) {
            T item = items.get(i);
            double w = item.getWeight();
            double v = item.getValue();

            if (w <= 0) {
                bound += v;
                continue;
            }

            if (w <= remainingCapacity) {
                remainingCapacity -= w;
                bound += v;
            } else {
                bound += v * (remainingCapacity / w);
                break;
            }
        }

        return bound;
    }

    private double getRatio(T item) {
        if (item.getWeight() <= 0) {
            return Double.POSITIVE_INFINITY;
        }
        return item.getValue() / item.getWeight();
    }
}
