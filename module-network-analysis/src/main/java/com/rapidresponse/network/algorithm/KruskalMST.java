package com.rapidresponse.network.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.rapidresponse.network.datastructure.UnionFind;
import com.rapidresponse.shared.model.Edge;

/**
 * Implements Kruskal's Algorithm to find the Minimum Spanning Tree (MST).
 * Used to determine the minimum-cost set of blocked roads to clear to reconnect the network.
 */
public class KruskalMST {

    /**
     * Finds the minimum-cost set of roads to clear.
     *
     * @param allBlockedRoads List of blocked edges (candidates for clearing)
     * @param totalNodes      Total number of nodes in the graph
     * @param allNodeIds      Set of all node IDs to initialize the mapping
     * @param initialUf       (Optional) Pre-initialized UnionFind with unblocked edges already merged.
     *                        If null, creates a fresh UnionFind for all nodes.
     * @return MSTResult containing selected edges, cost, component reduction, and the UnionFind state
     */
    public MSTResult findMinimumSpanningTree(List<Edge> allBlockedRoads, int totalNodes, Set<Long> allNodeIds, UnionFind initialUf) {
        long startTime = System.nanoTime();

        // 1. Build Node ID to integer index mapping for UnionFind
        Map<Long, Integer> nodeIdToIndex = new HashMap<>();
        int index = 0;
        for (Long nodeId : allNodeIds) {
            nodeIdToIndex.put(nodeId, index++);
        }

        // 2. Initialize or reuse UnionFind
        UnionFind uf = (initialUf != null) ? initialUf : new UnionFind(totalNodes);
        int componentsBefore = uf.getComponentCount();

        // 3. Sort edges by weight (distance ascending) - Kruskal's greedy step
        List<Edge> sortedEdges = new ArrayList<>(allBlockedRoads);
        sortedEdges.sort(Comparator.comparingDouble(Edge::getDistanceKm));

        List<Edge> mstEdges = new ArrayList<>();
        double totalCost = 0.0;

        // 4. Iterate edges and apply Union-Find
        for (Edge edge : sortedEdges) {
            // Early exit if the graph is fully connected
            if (uf.getComponentCount() == 1) {
                break;
            }

            Integer srcIdx = nodeIdToIndex.get(edge.getSourceId());
            Integer tgtIdx = nodeIdToIndex.get(edge.getTargetId());

            if (srcIdx == null || tgtIdx == null) {
                continue; // Should not happen in a valid graph
            }

            // O(α(V)) cycle detection
            if (!uf.connected(srcIdx, tgtIdx)) {
                uf.union(srcIdx, tgtIdx);
                mstEdges.add(edge);
                totalCost += edge.getDistanceKm();
            }
        }

        int componentsAfter = uf.getComponentCount();
        long endTime = System.nanoTime();

        return MSTResult.builder()
                .mstEdges(mstEdges)
                .totalClearingCost(totalCost)
                .componentsBeforeMST(componentsBefore)
                .componentsAfterMST(componentsAfter)
                .resultingUnionFind(uf)
                .nodeIdToIndex(nodeIdToIndex)
                .executionTimeNanos(endTime - startTime)
                .build();
    }
}
