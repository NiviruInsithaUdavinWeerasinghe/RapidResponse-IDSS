package com.rapidresponse.route.model;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for Graph construction, node retrieval, neighbor queries,
 * and edge cases (isolated nodes, self-loop rejection).
 */
class GraphTest {

    private Graph graph;

    @BeforeEach
    void setUp() {
        graph = new Graph();
    }

    // ======================== Node Tests ========================

    @Test
    void addNode_shouldStoreNode() {
        Node node = new Node(1L, "HQ Alpha", 7.29, 80.63, NodeType.HQ);
        graph.addNode(node);

        assertEquals(1, graph.getNodeCount());
        assertNotNull(graph.getNode(1L));
        assertEquals("HQ Alpha", graph.getNode(1L).getName());
    }

    @Test
    void addNode_nullNode_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> graph.addNode(null));
    }

    @Test
    void getNode_nonExistent_shouldReturnNull() {
        assertNull(graph.getNode(999L));
    }

    @Test
    void getAllNodeIds_shouldReturnAllIds() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(3L, "C", 0, 0, NodeType.RESCUE_CAMP));

        Set<Long> ids = graph.getAllNodeIds();
        assertEquals(3, ids.size());
        assertTrue(ids.containsAll(Set.of(1L, 2L, 3L)));
    }

    // ======================== Edge Tests ========================

    @Test
    void addEdge_directed_shouldAddOneWay() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));

        graph.addEdge(1L, 2L, 5.0, 10.0);

        assertEquals(1, graph.getEdgeCount());
        assertEquals(1, graph.getNeighbors(1L).size());
        assertEquals(0, graph.getNeighbors(2L).size()); // no reverse edge
    }

    @Test
    void addUndirectedEdge_shouldAddBothDirections() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));

        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);

        assertEquals(2, graph.getEdgeCount()); // two directed edges
        assertEquals(1, graph.getNeighbors(1L).size());
        assertEquals(1, graph.getNeighbors(2L).size());

        // Verify edge properties
        Edge edgeAB = graph.getNeighbors(1L).get(0);
        assertEquals(1L, edgeAB.getSourceId());
        assertEquals(2L, edgeAB.getTargetId());
        assertEquals(5.0, edgeAB.getDistanceKm());
        assertEquals(10.0, edgeAB.getTravelTimeMins());
    }

    @Test
    void addEdge_selfLoop_shouldThrow() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> graph.addEdge(1L, 1L, 1.0, 1.0)
        );
        assertTrue(ex.getMessage().contains("Self-loops"));
    }

    @Test
    void addEdge_missingSourceNode_shouldThrow() {
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));

        assertThrows(IllegalArgumentException.class, () -> graph.addEdge(1L, 2L, 1.0, 1.0));
    }

    @Test
    void addEdge_missingTargetNode_shouldThrow() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));

        assertThrows(IllegalArgumentException.class, () -> graph.addEdge(1L, 2L, 1.0, 1.0));
    }

    // ======================== Neighbor Queries ========================

    @Test
    void getNeighbors_multipleEdges_shouldReturnAll() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.HQ));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(3L, "C", 0, 0, NodeType.RESCUE_CAMP));

        graph.addEdge(1L, 2L, 3.0, 5.0);
        graph.addEdge(1L, 3L, 7.0, 12.0);

        List<Edge> neighbors = graph.getNeighbors(1L);
        assertEquals(2, neighbors.size());
    }

    @Test
    void getNeighbors_nonExistentNode_shouldReturnEmptyList() {
        List<Edge> neighbors = graph.getNeighbors(999L);
        assertNotNull(neighbors);
        assertTrue(neighbors.isEmpty());
    }

    @Test
    void getNeighbors_returnedListIsUnmodifiable() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));
        graph.addEdge(1L, 2L, 1.0, 1.0);

        List<Edge> neighbors = graph.getNeighbors(1L);
        assertThrows(UnsupportedOperationException.class, () ->
                neighbors.add(new Edge(1L, 2L, 1.0, 1.0))
        );
    }

    // ======================== Isolated Node ========================

    @Test
    void isolatedNode_shouldHaveNoNeighbors() {
        graph.addNode(new Node(1L, "Isolated", 0, 0, NodeType.INTERSECTION));

        assertEquals(1, graph.getNodeCount());
        assertEquals(0, graph.getEdgeCount());
        assertTrue(graph.getNeighbors(1L).isEmpty());
    }

    // ======================== Edge Blocked Flag ========================

    @Test
    void edge_blockedFlag_shouldBeSettable() {
        Edge edge = new Edge(1L, 2L, 5.0, 10.0);
        assertFalse(edge.isBlocked());

        edge.setBlocked(true);
        assertTrue(edge.isBlocked());
    }

    // ======================== Graph Counts ========================

    @Test
    void emptyGraph_shouldHaveZeroCounts() {
        assertEquals(0, graph.getNodeCount());
        assertEquals(0, graph.getEdgeCount());
        assertTrue(graph.getAllNodeIds().isEmpty());
    }

    @Test
    void complexGraph_shouldTrackCountsAccurately() {
        graph.addNode(new Node(1L, "A", 0, 0, NodeType.HQ));
        graph.addNode(new Node(2L, "B", 0, 0, NodeType.INTERSECTION));
        graph.addNode(new Node(3L, "C", 0, 0, NodeType.RESCUE_CAMP));
        graph.addNode(new Node(4L, "D", 0, 0, NodeType.INTERSECTION));

        graph.addEdge(1L, 2L, 1.0, 2.0);
        graph.addUndirectedEdge(2L, 3L, 3.0, 5.0);
        graph.addEdge(3L, 4L, 2.0, 4.0);

        assertEquals(4, graph.getNodeCount());
        assertEquals(4, graph.getEdgeCount()); // 1 directed + 2 undirected + 1 directed
    }
}
