package com.rapidresponse.sequencing.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TwoOptLocalSearchTest {

    private TwoOptLocalSearch solver;

    @BeforeEach
    public void setUp() {
        solver = new TwoOptLocalSearch();
    }

    @Test
    public void testNullMatrixThrowsException() {
        assertThrows(NullPointerException.class, () -> {
            solver.findOptimalTour(null, 0);
        });
    }

    @Test
    public void testMatrixTooSmallThrowsException() {
        double[][] dist = {{0.0}};
        assertThrows(IllegalArgumentException.class, () -> {
            solver.findOptimalTour(dist, 0);
        });
    }

    @Test
    public void testNonSquareMatrixThrowsException() {
        double[][] dist = {
            {0.0, 1.0},
            {1.0}
        };
        assertThrows(IllegalArgumentException.class, () -> {
            solver.findOptimalTour(dist, 0);
        });
    }

    @Test
    public void testStartNodeOutOfRangeThrowsException() {
        double[][] dist = {
            {0.0, 1.0},
            {1.0, 0.0}
        };
        assertThrows(IllegalArgumentException.class, () -> {
            solver.findOptimalTour(dist, -1);
        });
        assertThrows(IllegalArgumentException.class, () -> {
            solver.findOptimalTour(dist, 2);
        });
    }

    @Test
    public void testDisconnectedGraphThrowsException() {
        double inf = Double.MAX_VALUE / 2;
        double[][] dist = {
            {0.0, 5.0, inf},
            {5.0, 0.0, inf},
            {inf, inf, 0.0}
        };
        assertThrows(IllegalArgumentException.class, () -> {
            solver.findOptimalTour(dist, 0);
        });
    }

    @Test
    public void testSimpleTriangleSymmetricTSP() {
        double[][] dist = {
            {0.0, 10.0, 15.0},
            {10.0, 0.0, 20.0},
            {15.0, 20.0, 0.0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);

        assertNotNull(result);
        assertEquals(3, result.getProblemSize());
        assertEquals(0, result.getMemoryUsedBytes());
        assertTrue(result.getExecutionTimeNanos() > 0);

        List<Integer> seq = result.getTourSequence();
        assertEquals(4, seq.size());
        assertEquals(0, seq.get(0));
        assertEquals(0, seq.get(3));

        // Tour must visit all nodes exactly once and return to depot
        assertTrue(seq.contains(0));
        assertTrue(seq.contains(1));
        assertTrue(seq.contains(2));

        // Total distance must match expected cycle: 0 -> 1 -> 2 -> 0 => 10 + 20 + 15 = 45.0
        assertEquals(45.0, result.getTotalDistance(), 1e-6);
    }

    @Test
    public void test2OptUntanglesCrossing() {
        double sqrt8 = Math.sqrt(8);
        double[][] dist = {
            {0.0, 2.0, 2.0, sqrt8},
            {2.0, 0.0, sqrt8, 2.0},
            {2.0, sqrt8, 0.0, 2.0},
            {sqrt8, 2.0, 2.0, 0.0}
        };

        TourResult result = solver.findOptimalTour(dist, 0);
        assertNotNull(result);
        assertEquals(4, result.getProblemSize());
        assertEquals(8.0, result.getTotalDistance(), 1e-6);
    }
}
