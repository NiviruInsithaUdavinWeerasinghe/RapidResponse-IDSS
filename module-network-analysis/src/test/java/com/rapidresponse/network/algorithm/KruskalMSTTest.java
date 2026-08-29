package com.rapidresponse.network.algorithm;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.rapidresponse.shared.model.Edge;

class KruskalMSTTest {

    private KruskalMST kruskalMST;

    @BeforeEach
    void setUp() {
        kruskalMST = new KruskalMST();
    }

    @Test
    void findMinimumSpanningTree_simpleTriangle_shouldPickTwoCheapestEdges() {
        // Nodes 1, 2, 3
        Set<Long> nodes = Set.of(1L, 2L, 3L);
        // Edges: 1-2(5.0), 2-3(10.0), 1-3(15.0)
        List<Edge> edges = List.of(
                new Edge(1L, 2L, 5.0, 5.0),
                new Edge(2L, 3L, 10.0, 10.0),
                new Edge(1L, 3L, 15.0, 15.0)
        );

        MSTResult result = kruskalMST.findMinimumSpanningTree(edges, 3, nodes, null);

        assertEquals(2, result.getMstEdges().size());
        assertEquals(15.0, result.getTotalClearingCost()); // 5 + 10
        assertEquals(1, result.getComponentsAfterMST());
        assertEquals(3, result.getComponentsBeforeMST());
    }

    @Test
    void findMinimumSpanningTree_redundantEdges_shouldRejectCycles() {
        // Nodes 1, 2, 3, 4
        Set<Long> nodes = Set.of(1L, 2L, 3L, 4L);
        // Square with a diagonal
        List<Edge> edges = List.of(
                new Edge(1L, 2L, 2.0, 2.0),
                new Edge(2L, 3L, 3.0, 3.0),
                new Edge(3L, 4L, 4.0, 4.0),
                new Edge(4L, 1L, 5.0, 5.0),
                new Edge(1L, 3L, 1.0, 1.0) // Cheap diagonal
        );

        MSTResult result = kruskalMST.findMinimumSpanningTree(edges, 4, nodes, null);

        assertEquals(3, result.getMstEdges().size()); // Need 3 edges for 4 nodes
        assertEquals(7.0, result.getTotalClearingCost()); // 1 (diag) + 2 (1-2) + 4 (3-4) -> Wait, 1-3 is 1, 1-2 is 2, 2-3 is 3, 3-4 is 4. Sorted: 1-3(1), 1-2(2), 2-3(3), 3-4(4). MST: 1-3, 1-2, 3-4. Cost: 1+2+4=7.0
        assertEquals(1, result.getComponentsAfterMST());
    }

    @Test
    void findMinimumSpanningTree_disconnectedForest_shouldReturnPartialMST() {
        // Nodes 1, 2, 3, 4
        Set<Long> nodes = Set.of(1L, 2L, 3L, 4L);
        // Two disjoint pairs: 1-2 and 3-4
        List<Edge> edges = List.of(
                new Edge(1L, 2L, 2.0, 2.0),
                new Edge(3L, 4L, 3.0, 3.0)
        );

        MSTResult result = kruskalMST.findMinimumSpanningTree(edges, 4, nodes, null);

        assertEquals(2, result.getMstEdges().size());
        assertEquals(5.0, result.getTotalClearingCost()); // 2 + 3
        assertEquals(2, result.getComponentsAfterMST()); // Left with 2 components
        assertEquals(4, result.getComponentsBeforeMST());
    }
}
