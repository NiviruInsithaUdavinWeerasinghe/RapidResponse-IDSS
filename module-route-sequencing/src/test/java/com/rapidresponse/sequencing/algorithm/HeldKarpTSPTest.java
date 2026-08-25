package com.rapidresponse.sequencing.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link HeldKarpTSP}.
 *
 * <p>Test strategy mirrors the style of BranchAndBoundSolverTest in
 * module-shared-algorithms: explicit known-answer correctness tests,
 * boundary enforcement tests, degenerate edge-case tests, and metric
 * recording tests.
 *
 * <p>Implements Issue #22 — Module 5 Route Sequencing.
 */
class HeldKarpTSPTest {

    private HeldKarpTSP solver;

    // Sentinel for "no direct road" in test matrices
    private static final double INF = Double.MAX_VALUE / 2;

    @BeforeEach
    void setUp() {
        solver = new HeldKarpTSP();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Correctness — known-optimal answers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * 3-node triangle where every edge has weight 1.0.
     * Optimal tour: 0 → 1 → 2 → 0 (or any rotation), total = 3.0.
     * tourSequence must have 4 elements (depot appears at start and end).
     */
    @Test
    void testThreeNodeTriangle_knownOptimal() {
        double[][] dist = {
            {0, 1, 1},
            {1, 0, 1},
            {1, 1, 0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);

        assertEquals(3.0, result.getTotalDistance(), 1e-9,
                "Triangle tour must cost 3.0");
        assertEquals(4, result.getTourSequence().size(),
                "Tour sequence must have n+1 elements (depot counted twice)");
        assertEquals(0, result.getTourSequence().get(0),
                "Tour must start at depot (index 0)");
        assertEquals(0, result.getTourSequence().get(result.getTourSequence().size() - 1),
                "Tour must end at depot (index 0)");
    }

    /**
     * 4-node graph shaped like a square (perimeter edges = 1.0, diagonal = 10.0).
     * Optimal tour follows the perimeter: cost = 4.0.
     * Going diagonally would cost 1 + 10 + 1 = 12, so perimeter is optimal.
     */
    @Test
    void testFourNodeSquare_perimeterOptimal() {
        // Nodes: 0(top-left), 1(top-right), 2(bottom-right), 3(bottom-left)
        double[][] dist = {
            {0, 1, 10, 1},
            {1, 0,  1, 10},
            {10, 1, 0,  1},
            {1, 10,  1, 0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);

        assertEquals(4.0, result.getTotalDistance(), 1e-9,
                "Square perimeter tour must cost 4.0");
        assertEquals(5, result.getTourSequence().size());
        assertEquals(0, result.getTourSequence().get(0));
        assertEquals(0, result.getTourSequence().get(4));
    }

    /**
     * Asymmetric distance matrix — forward/reverse directions differ.
     * Verifies the DP handles directed graphs correctly.
     *
     * 3 nodes. Distances:
     *   0→1=1, 1→0=5
     *   1→2=1, 2→1=5
     *   0→2=5, 2→0=1
     * Optimal tour 0→1→2→0: cost = 1+1+1 = 3.0
     * Reverse  tour 0→2→1→0: cost = 5+5+5 = 15.0
     */
    @Test
    void testAsymmetricDistances_directedOptimal() {
        double[][] dist = {
            {0, 1, 5},
            {5, 0, 1},
            {1, 5, 0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);

        assertEquals(3.0, result.getTotalDistance(), 1e-9,
                "Directed optimal tour 0→1→2→0 must cost 3.0");
    }

    /**
     * Custom start node (depot = node 2).
     * Uses the same triangle matrix — optimal cost must still be 3.0
     * regardless of which node is designated depot.
     */
    @Test
    void testCustomStartNode() {
        double[][] dist = {
            {0, 1, 1},
            {1, 0, 1},
            {1, 1, 0}
        };

        TourResult result = solver.findOptimalTour(dist, 2);

        assertEquals(3.0, result.getTotalDistance(), 1e-9,
                "Triangle tour cost must be 3.0 regardless of startNode");
        assertEquals(2, result.getTourSequence().get(0),
                "Tour must start at custom depot (index 2)");
        assertEquals(2, result.getTourSequence().get(result.getTourSequence().size() - 1),
                "Tour must return to custom depot (index 2)");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Degenerate / edge cases
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Minimum valid TSP: 2 nodes (depot + 1 stop).
     * Only possible tour: 0→1→0; cost = dist[0][1] + dist[1][0].
     */
    @Test
    void testTwoNodes_minimumValidTSP() {
        double[][] dist = {
            {0, 7},
            {7, 0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);

        assertEquals(14.0, result.getTotalDistance(), 1e-9,
                "Two-node round trip must cost 14.0");
        assertEquals(3, result.getTourSequence().size(),
                "Two-node tour sequence must be [0, 1, 0] — size 3");
        assertEquals(List.of(0, 1, 0), result.getTourSequence());
    }

    /**
     * 5-node fully-connected uniform graph (all edges = 1.0).
     * Any Hamiltonian tour visits 5 edges → cost = 5.0.
     */
    @Test
    void testFiveNodeUniform_anyCostIsFive() {
        int n = 5;
        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = (i == j) ? 0 : 1.0;

        TourResult result = solver.findOptimalTour(dist, 0);

        assertEquals(5.0, result.getTotalDistance(), 1e-9,
                "Uniform-weight 5-node tour must cost 5.0");
        assertEquals(n + 1, result.getTourSequence().size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Safety limit enforcement
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * n = MAX_NODES (18) must NOT throw — verifies we accept the boundary.
     * We build a uniform-weight matrix so we know the cost: 18.0.
     */
    @Test
    void testSizeLimit_exactlyAtMax_doesNotThrow() {
        int n = HeldKarpTSP.MAX_NODES; // 18
        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = (i == j) ? 0 : 1.0;

        TourResult result = assertDoesNotThrow(() -> solver.findOptimalTour(dist, 0),
                "n=" + n + " should be accepted without exception");

        assertEquals((double) n, result.getTotalDistance(), 1e-9,
                "Uniform-weight tour for n=" + n + " must cost " + n + ".0");
    }

    /**
     * n = MAX_NODES + 1 (19) must throw IllegalArgumentException
     * with a message directing users to the 2-opt solver.
     */
    @Test
    void testSizeLimit_exceedsMax_throwsWithMessage() {
        int n = HeldKarpTSP.MAX_NODES + 1; // 19
        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = (i == j) ? 0 : 1.0;

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, 0),
                "n=" + n + " should throw IllegalArgumentException");

        assertTrue(ex.getMessage().contains("2-opt"),
                "Exception message should mention the 2-opt solver as an alternative");
        assertTrue(ex.getMessage().contains(String.valueOf(HeldKarpTSP.MAX_NODES)),
                "Exception message should include MAX_NODES value");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Input validation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testNullMatrix_throwsNullPointerException() {
        assertThrows(NullPointerException.class,
                () -> solver.findOptimalTour(null, 0));
    }

    @Test
    void testTooFewNodes_throwsIllegalArgumentException() {
        double[][] dist = {{0}};
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, 0));
        assertTrue(ex.getMessage().contains("at least 2"));
    }

    @Test
    void testNonSquareMatrix_throwsIllegalArgumentException() {
        // 3 rows, but rows have different column counts
        double[][] dist = {
            {0, 1, 1},
            {1, 0, 1, 99},   // 4 columns — non-square
            {1, 1, 0}
        };
        assertThrows(IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, 0));
    }

    @Test
    void testStartNodeNegative_throwsIllegalArgumentException() {
        double[][] dist = {{0, 1}, {1, 0}};
        assertThrows(IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, -1));
    }

    @Test
    void testStartNodeTooLarge_throwsIllegalArgumentException() {
        double[][] dist = {{0, 1}, {1, 0}};
        assertThrows(IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, 2)); // valid range is [0, 1]
    }

    /**
     * Matrix with an unreachable stop — no complete tour is possible.
     * Node 2 cannot be reached from nodes 0 or 1 (row 0 and 1 have INF for col 2).
     * Solver must throw with "no valid complete tour" in the message.
     */
    @Test
    void testUnreachableStop_throwsIllegalArgumentException() {
        double[][] dist = {
            {0,   1,   INF},
            {1,   0,   INF},
            {INF, INF, 0  }
        };

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> solver.findOptimalTour(dist, 0));

        assertTrue(ex.getMessage().toLowerCase().contains("no valid complete tour"),
                "Exception message should mention 'no valid complete tour'");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Metric recording
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testExecutionTimeRecorded() {
        double[][] dist = {{0, 1}, {1, 0}};
        TourResult result = solver.findOptimalTour(dist, 0);
        assertTrue(result.getExecutionTimeNanos() > 0,
                "executionTimeNanos must be positive");
    }

    @Test
    void testMemoryEstimateRecorded() {
        int n = 4;
        double[][] dist = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = (i == j) ? 0 : 1.0;

        TourResult result = solver.findOptimalTour(dist, 0);
        int states = 1 << n; // 2^n
        // Memory = n * 2^n * (8 bytes for double dp + 4 bytes for int parent)
        long expectedMemory = (long) n * states * (8 + 4);
        assertEquals(expectedMemory, result.getMemoryUsedBytes(),
                "memoryUsedBytes must equal n * 2^n * 12 for Held-Karp");
    }

    @Test
    void testProblemSizeRecorded() {
        int n = 3;
        double[][] dist = {
            {0, 1, 1},
            {1, 0, 1},
            {1, 1, 0}
        };
        TourResult result = solver.findOptimalTour(dist, 0);
        assertEquals(n, result.getProblemSize(),
                "problemSize must equal the number of rows/cols in the distance matrix");
    }
}
