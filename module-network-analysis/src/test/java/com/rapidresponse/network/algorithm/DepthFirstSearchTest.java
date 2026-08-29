package com.rapidresponse.network.algorithm;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;

/**
 * Unit tests for DFS traversal: fully connected graph (1 component), multi-component graph,
 * single isolated node, empty graph, blocked roads, and connected-component discovery.
 */
class DepthFirstSearchTest {

    private DepthFirstSearch dfs;

    @BeforeEach
    void setUp() {
        dfs = new DepthFirstSearch();
    }

    // ======================== traverse() — Fully Connected Graph ========================

    @Test
    void traverse_fullyConnectedGraph_shouldVisitEveryNode() {
        Graph graph = chainGraph(4);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(4, result.getNodesVisited());
        assertEquals(Set.of(1L, 2L, 3L, 4L), new HashSet<>(result.getVisitedNodeIds()));
    }

    @Test
    void traverse_cyclicGraph_shouldNotRevisitNodes() {
        Graph graph = emptyGraph(3);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 1L, 5.0, 10.0);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(3, result.getNodesVisited(), "each node must be counted exactly once");
    }

    // ======================== traverse() — Single-Node Graph ========================

    @Test
    void traverse_singleNodeGraph_shouldVisitOnlyItself() {
        Graph graph = emptyGraph(1);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(1, result.getNodesVisited());
        assertTrue(result.getParentMap().isEmpty(), "the start node has no parent");
        assertEquals(0, result.getDistanceLevels().get(1L));
    }

    @Test
    void traverse_nodeWithNoRoads_shouldVisitOnlyItself() {
        Graph graph = emptyGraph(4);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);

        TraversalResult result = dfs.traverse(graph, 4L);

        assertEquals(1, result.getNodesVisited());
        assertEquals(List.of(4L), new ArrayList<>(result.getVisitedNodeIds()));
    }

    // ======================== traverse() — Isolated Components ========================

    @Test
    void traverse_isolatedComponents_shouldVisitOnlyTheStartComponent() {
        Graph graph = emptyGraph(5);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(4L, 5L, 5.0, 10.0);

        TraversalResult fromA = dfs.traverse(graph, 1L);

        assertEquals(3, fromA.getNodesVisited());
        assertTrue(fromA.getVisitedNodeIds().containsAll(List.of(1L, 2L, 3L)));
        assertFalse(fromA.getVisitedNodeIds().contains(4L));
        assertFalse(fromA.getVisitedNodeIds().contains(5L));
    }

    // ======================== traverse() — Blocked Roads ========================

    @Test
    void traverse_blockedRoad_shouldCutOffNodesBehindIt() {
        Graph graph = chainGraph(4);
        blockRoad(graph, 2L, 3L);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(2, result.getNodesVisited());
        assertTrue(result.getVisitedNodeIds().containsAll(List.of(1L, 2L)));
        assertFalse(result.getVisitedNodeIds().contains(3L));
        assertFalse(result.getVisitedNodeIds().contains(4L));
    }

    @Test
    void traverse_blockedRoadWithDetour_shouldStillReachViaAlternatePath() {
        Graph graph = emptyGraph(3);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(1L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 2L, 5.0, 10.0);

        blockRoad(graph, 1L, 2L);
        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(3, result.getNodesVisited(), "node 2 is still reachable via node 3");
    }

    @Test
    void traverse_allRoadsBlocked_shouldVisitOnlyStartNode() {
        Graph graph = chainGraph(4);
        blockRoad(graph, 1L, 2L);
        blockRoad(graph, 2L, 3L);
        blockRoad(graph, 3L, 4L);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(1, result.getNodesVisited());
    }

    // ======================== traverse() — Depth Levels ========================

    @Test
    void traverse_startNode_shouldBeAtDepthZero() {
        Graph graph = chainGraph(3);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(0, result.getDistanceLevels().get(1L));
    }

    @Test
    void traverse_everyVisitedNode_shouldHaveADepthLevel() {
        Graph graph = chainGraph(4);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertEquals(result.getVisitedNodeIds().size(), result.getDistanceLevels().size());
        assertTrue(result.getDistanceLevels().keySet().containsAll(result.getVisitedNodeIds()));
    }

    // ======================== traverse() — Parent Map / DFS Tree ========================

    @Test
    void traverse_parentMap_shouldExcludeStartNode() {
        Graph graph = chainGraph(4);

        TraversalResult result = dfs.traverse(graph, 1L);

        assertFalse(result.getParentMap().containsKey(1L), "the root has no parent");
        assertEquals(result.getVisitedNodeIds().size() - 1, result.getParentMap().size());
    }

    // ======================== traverse() — Metrics ========================

    @Test
    void traverse_shouldRecordExecutionTime() {
        Graph graph = chainGraph(4);

        assertTrue(dfs.traverse(graph, 1L).getExecutionTimeNanos() > 0);
    }

    // ======================== traverse() — Validation ========================

    @Test
    void traverse_nullGraph_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> dfs.traverse(null, 1L));
    }

    @Test
    void traverse_nullStartNodeId_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> dfs.traverse(emptyGraph(2), null));
    }

    @Test
    void traverse_startNodeNotInGraph_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> dfs.traverse(emptyGraph(2), 99L));
    }

    // ======================== findAllConnectedComponents() ========================

    @Test
    void findAllConnectedComponents_fullyConnectedGraph_shouldReturnOneComponent() {
        Graph graph = chainGraph(4);

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertEquals(1, components.size());
        assertEquals(Set.of(1L, 2L, 3L, 4L), components.get(0));
    }

    @Test
    void findAllConnectedComponents_threeComponents_shouldReturnThreeSortedBySize() {
        // Component A: 1-2-3 (size 3). Component B: 4-5 (size 2). Component C: 6 (size 1).
        Graph graph = emptyGraph(6);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(4L, 5L, 5.0, 10.0);

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertEquals(3, components.size());
        assertEquals(3, components.get(0).size(), "largest component first");
        assertEquals(2, components.get(1).size());
        assertEquals(1, components.get(2).size(), "isolated node is the smallest component");
        assertTrue(components.get(0).containsAll(Set.of(1L, 2L, 3L)));
        assertTrue(components.get(1).containsAll(Set.of(4L, 5L)));
        assertTrue(components.get(2).contains(6L));
    }

    @Test
    void findAllConnectedComponents_singleIsolatedNode_shouldReturnOneComponent() {
        Graph graph = emptyGraph(1);

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertEquals(1, components.size());
        assertEquals(Set.of(1L), components.get(0));
    }

    @Test
    void findAllConnectedComponents_emptyGraph_shouldReturnEmptyList() {
        Graph graph = new Graph();

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertTrue(components.isEmpty());
    }

    @Test
    void findAllConnectedComponents_blockedRoads_shouldSplitIntoComponents() {
        // Chain 1-2-3-4, block the road between 2 and 3 to split into {1,2} and {3,4}.
        Graph graph = chainGraph(4);
        blockRoad(graph, 2L, 3L);

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertEquals(2, components.size());
        assertEquals(2, components.get(0).size());
        assertEquals(2, components.get(1).size());
    }

    @Test
    void findAllConnectedComponents_nullGraph_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> dfs.findAllConnectedComponents(null));
    }

    @Test
    void findAllConnectedComponents_allNodesIsolated_shouldReturnOneComponentPerNode() {
        Graph graph = emptyGraph(5);

        List<Set<Long>> components = dfs.findAllConnectedComponents(graph);

        assertEquals(5, components.size());
        for (Set<Long> component : components) {
            assertEquals(1, component.size());
        }
    }

    // ======================== Helpers ========================

    private static Graph emptyGraph(int count) {
        Graph graph = new Graph();
        for (long id = 1; id <= count; id++) {
            NodeType type = (id == 1) ? NodeType.HQ : NodeType.RESCUE_CAMP;
            graph.addNode(new Node(id, "Node " + id, 7.0 + id, 80.0 + id, type));
        }
        return graph;
    }

    private static Graph chainGraph(int count) {
        Graph graph = emptyGraph(count);
        for (long id = 1; id < count; id++) {
            graph.addUndirectedEdge(id, id + 1, 5.0, 10.0);
        }
        return graph;
    }

    private static void blockRoad(Graph graph, Long a, Long b) {
        directedEdge(graph, a, b).setBlocked(true);
        directedEdge(graph, b, a).setBlocked(true);
    }

    private static Edge directedEdge(Graph graph, Long sourceId, Long targetId) {
        return graph.getNeighbors(sourceId).stream()
                .filter(edge -> edge.getTargetId().equals(targetId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No edge " + sourceId + " -> " + targetId));
    }
}
