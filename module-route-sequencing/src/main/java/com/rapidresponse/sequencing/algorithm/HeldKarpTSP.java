package com.rapidresponse.sequencing.algorithm;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Held-Karp Dynamic Programming exact TSP solver.
 *
 * <p>Finds the globally optimal Hamiltonian tour — a route that visits every
 * stop exactly once and returns to the depot — using bitmask DP memoization.
 *
 * <h2>Algorithm</h2>
 * <pre>
 * State:  dp[mask][i] = minimum cost to visit the nodes encoded in {@code mask},
 *                        ending at node {@code i}.
 *
 * Base:   dp[1 << startNode][startNode] = 0.0
 *
 * Trans:  For each mask where bit last is set, for each next NOT in mask:
 *           dp[mask | (1 << next)][next] = min(dp[mask][last] + dist[last][next])
 *
 * Answer: min over all last of (dp[fullMask][last] + dist[last][startNode])
 * </pre>
 *
 * <h2>Complexity</h2>
 * <ul>
 *   <li>Time:  O(n² · 2ⁿ)</li>
 *   <li>Space: O(n · 2ⁿ) — the DP + parent tables</li>
 * </ul>
 *
 * <h2>Practical Limit</h2>
 * Inputs with {@code n > MAX_NODES} are rejected to prevent out-of-memory and
 * timeout conditions. Use {@link com.rapidresponse.sequencing.algorithm.TourResult}
 * consumers to fall back to the 2-opt heuristic for larger inputs.
 *
 * <p>Implements Issue #22 — Module 5 Route Sequencing.
 */
public class HeldKarpTSP {

    /**
     * Hard upper limit on the number of nodes this solver will accept.
     *
     * <p>At n=18 the DP table uses approximately 36 MB of heap
     * ({@code 18 × 2^18 × 8} bytes), which is safe in a Spring Boot
     * REST service context. At n=20 memory exceeds 160 MB and risks
     * GC pressure and request timeouts.
     */
    public static final int MAX_NODES = 18;

    /**
     * Finds the exact optimal Hamiltonian tour using Held-Karp DP.
     *
     * @param distanceMatrix square n×n matrix where {@code distanceMatrix[i][j]}
     *                       is the shortest road distance from stop {@code i} to
     *                       stop {@code j}. Use {@code Double.MAX_VALUE / 2} to
     *                       represent no direct connection.
     * @param startNode      index of the depot (HQ) in the matrix; must be in
     *                       {@code [0, n-1]}. By convention, index {@code 0} is
     *                       the depot when building the matrix via
     *                       {@code DistanceMatrixBuilder}.
     * @return {@link TourResult} containing the optimal visit sequence, total
     *         distance, problem size, execution time, and estimated memory usage.
     * @throws IllegalArgumentException if {@code n > MAX_NODES}, {@code n < 2},
     *                                  matrix is not square, {@code startNode} is
     *                                  out of range, or no complete tour is
     *                                  reachable (all stops connected).
     * @throws NullPointerException     if {@code distanceMatrix} is {@code null}.
     */
    public TourResult findOptimalTour(double[][] distanceMatrix, int startNode) {
        long startTime = System.nanoTime();

        // ── Input validation ───────────────────────────────────────────────────
        if (distanceMatrix == null) {
            throw new NullPointerException("distanceMatrix must not be null.");
        }

        int n = distanceMatrix.length;

        if (n < 2) {
            throw new IllegalArgumentException(
                    "TSP requires at least 2 stops, but got n=" + n + ".");
        }
        if (n > MAX_NODES) {
            throw new IllegalArgumentException(
                    "Input size n=" + n + " exceeds the Held-Karp limit (MAX_NODES=" +
                    MAX_NODES + "). Use the 2-opt heuristic solver " +
                    "(TwoOptLocalSearch) for larger inputs.");
        }
        for (int i = 0; i < n; i++) {
            if (distanceMatrix[i] == null || distanceMatrix[i].length != n) {
                throw new IllegalArgumentException(
                        "Distance matrix must be square (n×n). Row " + i +
                        " has length " + (distanceMatrix[i] == null ? "null" : distanceMatrix[i].length) +
                        ", expected " + n + ".");
            }
        }
        if (startNode < 0 || startNode >= n) {
            throw new IllegalArgumentException(
                    "startNode=" + startNode + " is out of range [0, " + (n - 1) + "].");
        }

        // ── DP table allocation ────────────────────────────────────────────────
        int states = 1 << n;                      // 2^n bitmask states
        double[][] dp     = new double[states][n]; // min-cost table
        int[][]    parent = new int[states][n];    // predecessor tracking

        for (double[] row : dp)    Arrays.fill(row, Double.MAX_VALUE / 2);
        for (int[]   row : parent) Arrays.fill(row, -1);

        // Base case: start at depot, only depot visited
        dp[1 << startNode][startNode] = 0.0;

        // ── Bottom-up DP fill ──────────────────────────────────────────────────
        // Iterate every possible visited-set (mask). For each node `last` that
        // is in the mask (i.e. the last stop reached), try extending to every
        // unvisited node `next`.
        for (int mask = 1; mask < states; mask++) {
            for (int last = 0; last < n; last++) {

                // Skip: `last` is not in this mask, or state is unreachable
                if ((mask & (1 << last)) == 0)         continue;
                if (dp[mask][last] >= Double.MAX_VALUE / 2) continue;

                for (int next = 0; next < n; next++) {
                    // Skip: `next` already visited in this mask
                    if ((mask & (1 << next)) != 0) continue;

                    double edgeCost = distanceMatrix[last][next];
                    // Skip: no road exists between last and next
                    if (edgeCost >= Double.MAX_VALUE / 2) continue;

                    int    newMask  = mask | (1 << next);
                    double newCost  = dp[mask][last] + edgeCost;

                    if (newCost < dp[newMask][next]) {
                        dp[newMask][next]     = newCost;
                        parent[newMask][next] = last;
                    }
                }
            }
        }

        // ── Extract optimal tour cost ──────────────────────────────────────────
        // All nodes must be visited (fullMask), then return to depot
        int    fullMask = states - 1;
        double bestCost = Double.MAX_VALUE / 2;
        int    lastNode = -1;

        for (int last = 0; last < n; last++) {
            if (last == startNode) continue; // don't count depot-to-itself

            double returnCost = distanceMatrix[last][startNode];
            if (returnCost >= Double.MAX_VALUE / 2) continue;

            double totalCost = dp[fullMask][last] + returnCost;
            if (totalCost < bestCost) {
                bestCost = totalCost;
                lastNode = last;
            }
        }

        // Guard: no complete tour reachable
        if (lastNode == -1 || bestCost >= Double.MAX_VALUE / 2) {
            throw new IllegalArgumentException(
                    "No valid complete tour can be formed — one or more stops are " +
                    "unreachable from the depot or from each other. Check the " +
                    "distance matrix for Double.MAX_VALUE entries.");
        }

        // ── Path reconstruction (backwards via parent table) ───────────────────
        List<Integer> reversePath = new ArrayList<>();
        int curMask = fullMask;
        int cur     = lastNode;

        while (cur != -1) {
            reversePath.add(cur);
            int prev = parent[curMask][cur];
            curMask ^= (1 << cur); // remove cur from mask
            cur = prev;
        }

        Collections.reverse(reversePath);
        reversePath.add(startNode); // close tour back to depot

        // ── Timing & memory estimate ───────────────────────────────────────────
        long executionTimeNanos = System.nanoTime() - startTime;
        // Two tables: dp (double = 8 bytes) and parent (int = 4 bytes)
        long memoryUsedBytes = (long) n * states * (8 + 4);

        return TourResult.builder()
                .tourSequence(reversePath)
                .totalDistance(bestCost)
                .problemSize(n)
                .executionTimeNanos(executionTimeNanos)
                .memoryUsedBytes(memoryUsedBytes)
                .build();
    }
}
