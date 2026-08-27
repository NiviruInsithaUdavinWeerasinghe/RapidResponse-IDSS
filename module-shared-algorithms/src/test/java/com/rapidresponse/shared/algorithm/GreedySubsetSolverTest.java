package com.rapidresponse.shared.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class GreedySubsetSolverTest {

    private GreedySubsetSolver<TestItem> greedySolver;
    private BranchAndBoundSolver<TestItem> bbSolver;

    static class TestItem implements Selectable {
        private final String label;
        private final double value;
        private final double weight;

        public TestItem(String label, double value, double weight) {
            this.label = label;
            this.value = value;
            this.weight = weight;
        }

        @Override
        public double getValue() {
            return value;
        }

        @Override
        public double getWeight() {
            return weight;
        }

        @Override
        public String getLabel() {
            return label;
        }
    }

    @BeforeEach
    void setUp() {
        greedySolver = new GreedySubsetSolver<>();
        bbSolver = new BranchAndBoundSolver<>();
    }

    @Test
    void testSingleBestItemOutperformsRatioGreedy() {
        // Capacity = 10
        // Item 1: v=51, w=5.1 (ratio = 10.0)
        // Item 2: v=100, w=10.0 (ratio = 10.0, but highest single value)
        // Ratio greedy sorts Item 1 first, takes it (v=51, remCap=4.9), cannot take Item 2. Ratio value = 51.
        // Single-best pass picks Item 2 (v=100, w=10.0).
        // Strengthened solver should return Item 2 with total value 100.
        List<TestItem> items = Arrays.asList(
                new TestItem("Item 1", 51, 5.1),
                new TestItem("Item 2", 100, 10.0)
        );

        SubsetResult<TestItem> greedyResult = greedySolver.solve(items, 10.0);
        SubsetResult<TestItem> bbResult = bbSolver.solve(items, 10.0);

        assertEquals(100.0, greedyResult.getTotalValue(), 1e-6);
        assertEquals(bbResult.getTotalValue(), greedyResult.getTotalValue(), 1e-6);
    }

    @Test
    void testGuaranteeFiftyPercentAgainstOptimalOnMultipleCases() {
        Random random = new Random(123);

        for (int trial = 0; trial < 10; trial++) {
            List<TestItem> items = new ArrayList<>();
            int numItems = 10 + random.nextInt(10);
            double capacity = 50 + random.nextInt(50);

            for (int i = 0; i < numItems; i++) {
                items.add(new TestItem("Item_" + i, random.nextInt(100) + 1, random.nextInt(40) + 1));
            }

            SubsetResult<TestItem> bbResult = bbSolver.solve(items, capacity);
            SubsetResult<TestItem> greedyResult = greedySolver.solve(items, capacity);

            assertTrue(greedyResult.getTotalValue() <= bbResult.getTotalValue() + 1e-6,
                    "Greedy cannot exceed optimal value");
            assertTrue(greedyResult.getTotalValue() >= 0.5 * bbResult.getTotalValue() - 1e-6,
                    "Greedy must guarantee >= 50% of optimal value");
            assertTrue(greedyResult.getTotalWeight() <= capacity + 1e-6,
                    "Greedy selection must be within capacity");
        }
    }

    @Test
    void testEmptyAndEdgeCases() {
        SubsetResult<TestItem> emptyResult = greedySolver.solve(Collections.emptyList(), 10.0);
        assertEquals(0.0, emptyResult.getTotalValue(), 1e-6);
        assertTrue(emptyResult.getSelectedItems().isEmpty());

        SubsetResult<TestItem> zeroCapResult = greedySolver.solve(
                Collections.singletonList(new TestItem("A", 10, 5)), 0.0);
        assertEquals(0.0, zeroCapResult.getTotalValue(), 1e-6);
        assertTrue(zeroCapResult.getSelectedItems().isEmpty());
    }
}
