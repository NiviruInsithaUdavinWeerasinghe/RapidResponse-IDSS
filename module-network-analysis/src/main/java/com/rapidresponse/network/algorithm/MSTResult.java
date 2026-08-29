package com.rapidresponse.network.algorithm;

import java.util.List;
import java.util.Set;

import com.rapidresponse.network.datastructure.UnionFind;
import com.rapidresponse.shared.model.Edge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result container for Kruskal's MST computation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MSTResult {

    /** The edges selected for the MST — roads to clear. */
    private List<Edge> mstEdges;

    /** Sum of edge weights (distance km) in the MST. */
    private double totalClearingCost;

    /** Number of connected components before MST edges were added. */
    private int componentsBeforeMST;

    /** Number of connected components after MST edges were added. */
    private int componentsAfterMST;

    /** The UnionFind state after MST, reusable for O(α(V)) connectivity queries. */
    private UnionFind resultingUnionFind;

    /** Node-ID-to-UnionFind-index mapping, needed to translate Long IDs for connectivity queries. */
    private java.util.Map<Long, Integer> nodeIdToIndex;

    /** Wall-clock duration of the MST computation in nanoseconds. */
    private long executionTimeNanos;
}
