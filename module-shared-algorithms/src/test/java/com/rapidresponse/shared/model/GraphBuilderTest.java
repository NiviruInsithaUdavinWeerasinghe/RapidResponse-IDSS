package com.rapidresponse.shared.model;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;

/**
 * Unit tests for GraphBuilder: constructing a Graph from JPA entities.
 */
class GraphBuilderTest {

    @Test
    void build_withNodesAndDirectedEdges_shouldConstructGraph() {
        List<NodeEntity> nodes = Arrays.asList(
                new NodeEntity(1L, "HQ", 7.29, 80.63, NodeType.HQ),
                new NodeEntity(2L, "Camp A", 7.30, 80.64, NodeType.RESCUE_CAMP),
                new NodeEntity(3L, "Junction", 7.31, 80.65, NodeType.INTERSECTION)
        );

        EdgeEntity edge1 = new EdgeEntity(1L, 2L, 5.0, 10.0, false, true);
        EdgeEntity edge2 = new EdgeEntity(2L, 3L, 3.0, 6.0, false, true);
        List<EdgeEntity> edges = Arrays.asList(edge1, edge2);

        Graph graph = GraphBuilder.build(nodes, edges);

        assertEquals(3, graph.getNodeCount());
        assertEquals(2, graph.getEdgeCount());
        assertEquals(1, graph.getNeighbors(1L).size());
        assertEquals(1, graph.getNeighbors(2L).size());
        assertEquals(0, graph.getNeighbors(3L).size());
    }

    @Test
    void build_withUndirectedEdge_shouldCreateBothDirections() {
        List<NodeEntity> nodes = Arrays.asList(
                new NodeEntity(1L, "A", 0, 0, NodeType.INTERSECTION),
                new NodeEntity(2L, "B", 0, 0, NodeType.INTERSECTION)
        );

        EdgeEntity undirectedEdge = new EdgeEntity(1L, 2L, 4.0, 8.0, false, false);
        List<EdgeEntity> edges = Collections.singletonList(undirectedEdge);

        Graph graph = GraphBuilder.build(nodes, edges);

        assertEquals(2, graph.getEdgeCount());
        assertEquals(1, graph.getNeighbors(1L).size());
        assertEquals(1, graph.getNeighbors(2L).size());
    }

    @Test
    void build_blockedEdges_shouldBeSkipped() {
        List<NodeEntity> nodes = Arrays.asList(
                new NodeEntity(1L, "A", 0, 0, NodeType.INTERSECTION),
                new NodeEntity(2L, "B", 0, 0, NodeType.INTERSECTION)
        );

        EdgeEntity blockedEdge = new EdgeEntity(1L, 2L, 4.0, 8.0, true, true);
        List<EdgeEntity> edges = Collections.singletonList(blockedEdge);

        Graph graph = GraphBuilder.build(nodes, edges);

        assertEquals(2, graph.getNodeCount());
        assertEquals(0, graph.getEdgeCount());
        assertTrue(graph.getNeighbors(1L).isEmpty());
    }

    @Test
    void build_emptyInputs_shouldReturnEmptyGraph() {
        Graph graph = GraphBuilder.build(Collections.emptyList(), Collections.emptyList());

        assertEquals(0, graph.getNodeCount());
        assertEquals(0, graph.getEdgeCount());
    }

    @Test
    void build_nodesOnly_shouldCreateIsolatedNodes() {
        List<NodeEntity> nodes = Arrays.asList(
                new NodeEntity(1L, "Isolated A", 0, 0, NodeType.HQ),
                new NodeEntity(2L, "Isolated B", 0, 0, NodeType.RESCUE_CAMP)
        );

        Graph graph = GraphBuilder.build(nodes, Collections.emptyList());

        assertEquals(2, graph.getNodeCount());
        assertEquals(0, graph.getEdgeCount());
        assertTrue(graph.getNeighbors(1L).isEmpty());
        assertTrue(graph.getNeighbors(2L).isEmpty());
    }
}
