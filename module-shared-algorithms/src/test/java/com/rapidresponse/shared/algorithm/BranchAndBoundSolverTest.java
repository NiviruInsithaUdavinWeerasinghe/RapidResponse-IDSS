package com.rapidresponse.shared.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

class BranchAndBoundSolverTest {

    private BranchAndBoundSolver<TestItem> solver;

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
        solver = new BranchAndBoundSolver<>();
    }

    @Test
    void testClassicKnapsackInstance() {
        // Classic Knapsack: Capacity = 10
        // Item 1: v=10, w=5 (ratio = 2)
        // Item 2: v=40, w=4 (ratio = 10)
        // Item 3: v=30, w=6 (ratio = 5)
        // Item 4: v=50, w=3 (ratio = 16.67)
        // Best subset for capacity 10: Item 4 (v=50, w=3) + Item 2 (v=40, w=4) = total value 90, weight 7
        List<TestItem> items = Arrays.asList(
                new TestItem("Item 1", 10, 5),
                new TestItem("Item 2", 40, 4),
                new TestItem("Item 3", 30, 6),
                new TestItem("Item 4", 50, 3)
        );

        SubsetResult<TestItem> result = solver.solve(items, 10.0);

        assertEquals(90.0, result.getTotalValue(), 1e-6);
        assertEquals(7.0, result.getTotalWeight(), 1e-6);
        assertEquals(2, result.getSelectedItems().size());
        assertTrue(result.getNodesExplored() > 0);
    }

    @Test
    void testSingleItem_Fits() {
        List<TestItem> items = Collections.singletonList(new TestItem("A", 100, 50));
        SubsetResult<TestItem> result = solver.solve(items, 60.0);

        assertEquals(100.0, result.getTotalValue(), 1e-6);
        assertEquals(50.0, result.getTotalWeight(), 1e-6);
        assertEquals(1, result.getSelectedItems().size());
    }

    @Test
    void testSingleItem_DoesNotFit() {
        List<TestItem> items = Collections.singletonList(new TestItem("A", 100, 50));
        SubsetResult<TestItem> result = solver.solve(items, 40.0);

        assertEquals(0.0, result.getTotalValue(), 1e-6);
        assertEquals(0.0, result.getTotalWeight(), 1e-6);
        assertTrue(result.getSelectedItems().isEmpty());
    }

    @Test
    void testAllItemsFit() {
        List<TestItem> items = Arrays.asList(
                new TestItem("Item 1", 10, 2),
                new TestItem("Item 2", 20, 3),
                new TestItem("Item 3", 30, 4)
        );

        SubsetResult<TestItem> result = solver.solve(items, 10.0);

        assertEquals(60.0, result.getTotalValue(), 1e-6);
        assertEquals(9.0, result.getTotalWeight(), 1e-6);
        assertEquals(3, result.getSelectedItems().size());
    }

    @Test
    void testNoItemsFit() {
        List<TestItem> items = Arrays.asList(
                new TestItem("Item 1", 10, 15),
                new TestItem("Item 2", 20, 25)
        );

        SubsetResult<TestItem> result = solver.solve(items, 10.0);

        assertEquals(0.0, result.getTotalValue(), 1e-6);
        assertEquals(0.0, result.getTotalWeight(), 1e-6);
        assertTrue(result.getSelectedItems().isEmpty());
    }

    @Test
    void testLargeRandomInstance() {
        Random random = new Random(42);
        List<TestItem> items = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            items.add(new TestItem("Item_" + i, random.nextInt(100) + 1, random.nextInt(50) + 1));
        }

        SubsetResult<TestItem> result = solver.solve(items, 100.0);

        assertNotNull(result.getSelectedItems());
        assertTrue(result.getTotalWeight() <= 100.0);
        assertTrue(result.getTotalValue() > 0.0);
        assertTrue(result.getNodesExplored() > 0);
    }
}
