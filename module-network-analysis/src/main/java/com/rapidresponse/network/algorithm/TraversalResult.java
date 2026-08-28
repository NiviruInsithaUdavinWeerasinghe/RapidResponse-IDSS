package com.rapidresponse.network.algorithm;

import java.util.Map;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result container for Module 3 graph traversals ({@link BreadthFirstSearch}).
 *
 * <p>Describes exactly which part of the road network is still reachable from a start
 * location, how far away each reachable location is in road hops, and how it was reached.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraversalResult {

    /**
     * Every node reachable from the start node, including the start node itself.
     * Iteration order is BFS visit order (start node first, then level 1, then level 2, ...).
     */
    private Set<Long> visitedNodeIds;

    /**
     * The BFS tree: maps each visited node to the node it was first discovered from.
     * Used to reconstruct the hop-shortest path back to the start by following parents.
     *
     * <p>The start node is deliberately <strong>absent</strong> from this map — it is the
     * root of the tree and has no parent, which is also the loop terminator when walking a
     * path back to the start.</p>
     */
    private Map<Long, Long> parentMap;

    /**
     * BFS level of each visited node: the number of road hops from the start node.
     * The start node maps to 0, its direct neighbours to 1, and so on.
     *
     * <p>Because BFS expands level by level, this is the <em>minimum</em> hop count to each
     * node — note that is hop count, not road distance in km.</p>
     */
    private Map<Long, Integer> distanceLevels;

    /** Total number of nodes reached, equal to {@code visitedNodeIds.size()}. */
    private int nodesVisited;

    /** Wall-clock duration of the traversal in nanoseconds, for algorithm comparison metrics. */
    private long executionTimeNanos;
}
