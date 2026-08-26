package com.rapidresponse.sequencing.algorithm;

import java.util.ArrayList;
import java.util.List;

/**
 * 2-opt Local Search Heuristic TSP solver.
 *
 * <p>Finds a high-quality Hamiltonian tour by first initializing a route using
 * the Nearest-Neighbor greedy heuristic starting at {@code startNode}, then
 * iteratively untangling crossings via 2-opt swaps until a local optimum is reached.
 *
 * <h2>Algorithm</h2>
 * <ol>
 *   <li>Initialize: start at depot, repeatedly visit the nearest unvisited node.</li>
 *   <li>Improve: for each pair of edges, test if swapping them reduces the tour cost.
 *       If so, reverse the segment and continue.</li>
 * </ol>
 *
 * <h2>Complexity</h2>
 * <ul>
 *   <li>Time:  O(k · n²) where k is the number of improvement passes.</li>
 *   <li>Space: O(n) to store the tour sequence.</li>
 * </ul>
 *
 * <p>Implements Issue #25 — Module 5 Route Sequencing.
 *
 * @author NiviruInsithaUdavinWeerasinghe
 */
public class TwoOptLocalSearch {

    /**
     * Finds a Hamiltonian tour using Nearest-Neighbor initialization followed by 2-opt swaps.
     *
     * @param distanceMatrix square n×n matrix where {@code distanceMatrix[i][j]}
     *                       is the shortest road distance from stop {@code i} to
     *                       stop {@code j}. Use {@code Double.MAX_VALUE / 2} to
     *                       represent no direct connection.
     * @param startNode      index of the depot (HQ) in the matrix; must be in
     *                       {@code [0, n-1]}.
     * @return {@link TourResult} containing the tour sequence, total distance,
     *         problem size, execution time, and zero memory usage.
     * @throws IllegalArgumentException if {@code n < 2}, matrix is not square,
     *                                  {@code startNode} is out of range, or no
     *                       valid complete tour can be formed (stops are unreachable).
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

        // ── Nearest-Neighbor Initialization ─────────────────────────────────────
        List<Integer> tour = new ArrayList<>();
        boolean[] visited = new boolean[n];

        int current = startNode;
        tour.add(current);
        visited[current] = true;

        for (int step = 1; step < n; step++) {
            int nextNode = -1;
            double minDist = Double.MAX_VALUE / 2;

            for (int candidate = 0; candidate < n; candidate++) {
                if (!visited[candidate]) {
                    double dist = distanceMatrix[current][candidate];
                    if (dist < minDist) {
                        minDist = dist;
                        nextNode = candidate;
                    }
                }
            }

            // Guard: isolated / unreachable component
            if (nextNode == -1 || minDist >= Double.MAX_VALUE / 2) {
                throw new IllegalArgumentException(
                        "No valid complete tour can be formed — one or more stops are " +
                        "unreachable from the depot or from each other. Check the " +
                        "distance matrix for Double.MAX_VALUE entries.");
            }

            current = nextNode;
            tour.add(current);
            visited[current] = true;
        }

        // Close the tour back to depot
        double returnCost = distanceMatrix[current][startNode];
        if (returnCost >= Double.MAX_VALUE / 2) {
            throw new IllegalArgumentException(
                    "No valid complete tour can be formed — one or more stops are " +
                    "unreachable from the depot or from each other. Check the " +
                    "distance matrix for Double.MAX_VALUE entries.");
        }
        tour.add(startNode);

        // Convert list to primitive array for high-performance in-place swaps
        int[] route = new int[n + 1];
        for (int i = 0; i <= n; i++) {
            route[i] = tour.get(i);
        }

        // ── 2-opt Local Search ──────────────────────────────────────────────────
        boolean improvement = true;
        double currentDistance = calculateTourDistance(route, distanceMatrix);

        while (improvement) {
            improvement = false;

            // Try all segment reversals from i to j
            // i starts at 1 (depot cannot be moved), j ends at n-1 (last node before depot)
            for (int i = 1; i < n - 1; i++) {
                for (int j = i + 1; j < n; j++) {
                    
                    int u1 = route[i - 1];
                    int u2 = route[i];
                    int v1 = route[j];
                    int v2 = route[j + 1];

                    double d_old = distanceMatrix[u1][u2] + distanceMatrix[v1][v2];
                    double d_new = distanceMatrix[u1][v1] + distanceMatrix[u2][v2];

                    if (d_old > d_new + 1e-9) {
                        // Reversing the segment between i and j untangles the crossing
                        reverseSegment(route, i, j);
                        currentDistance = currentDistance - d_old + d_new;
                        improvement = true;
                    }
                }
            }
        }

        // Convert back to List representation
        List<Integer> finalTour = new ArrayList<>(n + 1);
        for (int node : route) {
            finalTour.add(node);
        }

        long executionTimeNanos = System.nanoTime() - startTime;

        return TourResult.builder()
                .tourSequence(finalTour)
                .totalDistance(currentDistance)
                .problemSize(n)
                .executionTimeNanos(executionTimeNanos)
                .memoryUsedBytes(0) // operates in-place, negligible memory footprint
                .build();
    }

    private double calculateTourDistance(int[] route, double[][] distanceMatrix) {
        double dist = 0.0;
        for (int i = 0; i < route.length - 1; i++) {
            dist += distanceMatrix[route[i]][route[i + 1]];
        }
        return dist;
    }

    private void reverseSegment(int[] route, int i, int j) {
        while (i < j) {
            int temp = route[i];
            route[i] = route[j];
            route[j] = temp;
            i++;
            j--;
        }
    }
}
