package com.rapidresponse.shared.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Shared, generic Greedy Subset Solver with a Strengthened 2-Approximation (>= 50% of optimal value).
 *
 * <p><strong>Algorithm Description:</strong></p>
 * <ol>
 *   <li><strong>Ratio-Greedy Pass:</strong> Pre-sorts items by value-to-weight ratio ({@code value / weight}) in descending order.
 *       Iteratively includes items into the selection if their weight fits into the remaining capacity.</li>
 *   <li><strong>Single-Best Pass:</strong> Scans all items to identify the single feasible item with the highest absolute value.</li>
 *   <li><strong>Strengthened Combination:</strong> Compares the total value of the ratio-greedy selection against the single-best item value,
 *       and returns the selection producing the maximum value.</li>
 * </ol>
 *
 * <p><strong>Formal Guarantee & Proof Sketch (2-Approximation / >= 50% Optimal):</strong></p>
 * <pre>
 * Let OPT be the optimal total value for the 0-1 Knapsack problem.
 * Let LP_OPT be the optimal value of the fractional knapsack relaxation.
 * Clearly, OPT &lt;= LP_OPT.
 *
 * In the ratio-greedy pass, let k be the first item (the critical item) that does not fit into the remaining capacity.
 * The total value accumulated by the ratio-greedy pass before item k is V_greedy.
 * Adding the full value v_k of item k yields:
 *     V_greedy + v_k &gt; LP_OPT &gt;= OPT.
 *
 * Therefore:
 *     max(V_greedy, v_k) &gt; 0.5 * OPT.
 *
 * Since the single-best pass selects the maximum value feasible item v_max = max_{i: w_i &lt;= capacity} (v_i),
 * we have v_max &gt;= v_k.
 * Consequently, the combined strengthened solution value V_sol satisfies:
 *     V_sol = max(V_greedy, v_max) &gt;= max(V_greedy, v_k) &gt; 0.5 * OPT.
 *
 * Thus, V_sol is guaranteed to achieve at least 50% (1/2) of the true optimal value.
 * </pre>
 *
 * <p><strong>Time Complexity:</strong> O(n log n) dominated by item sorting.</p>
 *
 * @param <T> type of selectable items
 */
public class GreedySubsetSolver<T extends Selectable> {

    /**
     * Solves the subset selection problem using the strengthened 2-approximation greedy algorithm.
     *
     * @param items list of selectable items
     * @param capacity maximum allowable total weight
     * @return SubsetResult containing the selected items and performance metrics
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

        // 1. Ratio-Greedy Pass
        List<T> sortedItems = new ArrayList<>(items);
        sortedItems.sort(Comparator.comparingDouble(this::getRatio).reversed());

        List<T> greedySelected = new ArrayList<>();
        double greedyValue = 0.0;
        double greedyWeight = 0.0;
        double remCapacity = capacity;

        for (T item : sortedItems) {
            if (item.getWeight() <= remCapacity + 1e-9) {
                greedySelected.add(item);
                greedyValue += item.getValue();
                greedyWeight += item.getWeight();
                remCapacity -= item.getWeight();
            }
        }

        // 2. Single-Best Pass: Find single item with highest absolute value that fits
        T singleBestItem = null;
        double singleBestValue = -1.0;

        for (T item : items) {
            if (item.getWeight() <= capacity + 1e-9) {
                if (item.getValue() > singleBestValue) {
                    singleBestValue = item.getValue();
                    singleBestItem = item;
                }
            }
        }

        // 3. Strengthened Combination: Return max(greedy_result, single_best_result)
        List<T> finalSelected;
        double finalValue;
        double finalWeight;

        if (singleBestItem != null && singleBestValue > greedyValue) {
            finalSelected = Collections.singletonList(singleBestItem);
            finalValue = singleBestItem.getValue();
            finalWeight = singleBestItem.getWeight();
        } else {
            finalSelected = greedySelected;
            finalValue = greedyValue;
            finalWeight = greedyWeight;
        }

        long executionTimeNanos = System.nanoTime() - startTime;

        return SubsetResult.<T>builder()
                .selectedItems(finalSelected)
                .totalValue(finalValue)
                .totalWeight(finalWeight)
                .capacityUsed(finalWeight)
                .nodesExplored(0)
                .nodesPruned(0)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }

    private double getRatio(T item) {
        if (item.getWeight() <= 0) {
            return Double.POSITIVE_INFINITY;
        }
        return item.getValue() / item.getWeight();
    }
}
