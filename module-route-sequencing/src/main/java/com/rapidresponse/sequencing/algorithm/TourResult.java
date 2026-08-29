package com.rapidresponse.sequencing.algorithm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result container for TSP tour solvers (Held-Karp exact and 2-opt heuristic).
 *
 * <p>The {@code tourSequence} is a list of node indices (0-based) representing the
 * visit order, including the return leg back to the depot. For example, a 3-stop tour
 * starting at depot (index 0) looks like: {@code [0, 2, 1, 0]}.
 *
 * <p>Used by both Module 5 algorithm classes so that the compare endpoint can directly
 * contrast exact vs. heuristic results with a common type.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourResult {

    /**
     * Ordered list of node indices visited during the tour.
     * The first and last element are both the depot (startNode).
     * Size = problemSize + 1.
     */
    private List<Integer> tourSequence;

    /**
     * Total road distance (sum of edge weights) along the optimal tour.
     * Units match the input distance matrix (typically km).
     */
    private double totalDistance;

    /**
     * Number of stop nodes in this tour (does NOT include the depot counted twice).
     * Equals the number of rows/columns in the input distance matrix.
     */
    private int problemSize;

    /**
     * Wall-clock execution time of the solver in nanoseconds.
     * Measured with {@link System#nanoTime()}.
     */
    private long executionTimeNanos;

    /**
     * Estimated heap memory consumed by the DP tables, in bytes.
     * For Held-Karp: {@code n * 2^n * 8} bytes (one double per DP cell).
     * For 2-opt: 0 (operates in-place on the tour array).
     */
    private long memoryUsedBytes;
}
