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
 * Unit tests for BFS traversal: fully connected networks, isolated components, single-node
 * graphs, blocked roads, hop-level recording, BFS-tree path reconstruction, and validation.
 */
class BreadthFirstSearchTest {

    private BreadthFirstSearch bfs;

    @BeforeEach
    void setUp() {
        bfs = new BreadthFirstSearch();
    }

    // ======================== Fully Connected Graph ========================

    @Test
    void traverse_fullyConnectedGraph_shouldVisitEveryNode() {
        // HQ(1) - Camp(2) - Camp(3) - Camp(4), a connected chain of two-way roads.
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(4, result.getNodesVisited());
        assertEquals(Set.of(1L, 2L, 3L, 4L), new HashSet<>(result.getVisitedNodeIds()));
        assertEquals(graph.getNodeCount(), result.getNodesVisited(),
                "a connected network should be fully reachable");
    }

    @Test
    void traverse_cyclicGraph_shouldNotRevisitNodes() {
        // Triangle: 1-2, 2-3, 3-1. Without a visited set this would loop forever.
        Graph graph = emptyGraph(3);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 1L, 5.0, 10.0);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(3, result.getNodesVisited(), "each node must be counted exactly once");
        assertEquals(3, result.getVisitedNodeIds().size());
    }

    // ======================== Single-Node Graph ========================

    @Test
    void traverse_singleNodeGraph_shouldVisitOnlyItself() {
        Graph graph = emptyGraph(1);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(1, result.getNodesVisited());
        assertEquals(List.of(1L), new ArrayList<>(result.getVisitedNodeIds()));
        assertTrue(result.getParentMap().isEmpty(), "the start node is the root and has no parent");
        assertEquals(0, result.getDistanceLevels().get(1L));
    }

    @Test
    void traverse_nodeWithNoRoads_shouldVisitOnlyItself() {
        // Node 4 exists in the network but no road was ever built to it.
        Graph graph = emptyGraph(4);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);

        TraversalResult result = bfs.traverse(graph, 4L);

        assertEquals(1, result.getNodesVisited());
        assertEquals(List.of(4L), new ArrayList<>(result.getVisitedNodeIds()));
    }

    // ======================== Isolated Components ========================

    @Test
    void traverse_isolatedComponents_shouldVisitOnlyTheStartComponent() {
        // Component A: 1-2-3.  Component B: 4-5.  No road between them.
        Graph graph = emptyGraph(5);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(4L, 5L, 5.0, 10.0);

        TraversalResult fromA = bfs.traverse(graph, 1L);

        assertEquals(3, fromA.getNodesVisited());
        assertTrue(fromA.getVisitedNodeIds().containsAll(List.of(1L, 2L, 3L)));
        assertFalse(fromA.getVisitedNodeIds().contains(4L), "the far component is unreachable");
        assertFalse(fromA.getVisitedNodeIds().contains(5L));

        // Starting inside the other component reaches only that component.
        TraversalResult fromB = bfs.traverse(graph, 4L);

        assertEquals(2, fromB.getNodesVisited());
        assertTrue(fromB.getVisitedNodeIds().containsAll(List.of(4L, 5L)));
        assertFalse(fromB.getVisitedNodeIds().contains(1L));
    }

    // ======================== Blocked Roads ========================

    @Test
    void traverse_blockedRoad_shouldCutOffTheNodeBehindIt() {
        // Chain 1-2-3-4 with the only road into 3 collapsed: 3 and 4 become unreachable.
        Graph graph = chainGraph(4);
        blockRoad(graph, 2L, 3L);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(2, result.getNodesVisited());
        assertTrue(result.getVisitedNodeIds().containsAll(List.of(1L, 2L)));
        assertFalse(result.getVisitedNodeIds().contains(3L), "blocked road must not be traversed");
        assertFalse(result.getVisitedNodeIds().contains(4L), "and nothing behind it is reachable");
    }

    @Test
    void traverse_blockedRoadWithDetour_shouldStillReachViaLongerPath() {
        // 1-2 direct, plus the detour 1-3-2. Blocking the direct road costs an extra hop.
        Graph graph = emptyGraph(3);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(1L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 2L, 5.0, 10.0);

        TraversalResult before = bfs.traverse(graph, 1L);
        assertEquals(1, before.getDistanceLevels().get(2L), "direct road is one hop");

        blockRoad(graph, 1L, 2L);
        TraversalResult after = bfs.traverse(graph, 1L);

        assertEquals(3, after.getNodesVisited(), "node 2 is still reachable via the detour");
        assertEquals(2, after.getDistanceLevels().get(2L), "detour costs two hops");
        assertEquals(3L, after.getParentMap().get(2L), "node 2 must now be discovered from node 3");
    }

    @Test
    void traverse_allRoadsBlocked_shouldVisitOnlyTheStartNode() {
        Graph graph = chainGraph(4);
        blockRoad(graph, 1L, 2L);
        blockRoad(graph, 2L, 3L);
        blockRoad(graph, 3L, 4L);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(1, result.getNodesVisited());
        assertEquals(List.of(1L), new ArrayList<>(result.getVisitedNodeIds()));
    }

    @Test
    void traverse_oneDirectionBlocked_shouldStillTraverseTheOpenDirection() {
        // Blocking only the 2->1 carriageway must not stop 1->2 traffic.
        Graph graph = emptyGraph(2);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        directedEdge(graph, 2L, 1L).setBlocked(true);

        assertEquals(2, bfs.traverse(graph, 1L).getNodesVisited(), "1 -> 2 is still open");
        assertEquals(1, bfs.traverse(graph, 2L).getNodesVisited(), "2 -> 1 is blocked");
    }

    // ======================== Hop Levels ========================

    @Test
    void traverse_shouldRecordHopCountFromStart() {
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(0, result.getDistanceLevels().get(1L));
        assertEquals(1, result.getDistanceLevels().get(2L));
        assertEquals(2, result.getDistanceLevels().get(3L));
        assertEquals(3, result.getDistanceLevels().get(4L));
    }

    @Test
    void traverse_shouldRecordMinimumHopCountNotFirstPathFound() {
        // 1 reaches 4 directly (1 hop) and also the long way round 1-2-3-4 (3 hops).
        Graph graph = emptyGraph(4);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(2L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 4L, 5.0, 10.0);
        graph.addUndirectedEdge(1L, 4L, 5.0, 10.0);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(1, result.getDistanceLevels().get(4L), "BFS must record the shortest hop count");
    }

    @Test
    void traverse_shouldVisitInLevelOrder() {
        // Star with a tail: 1 -> {2,3}, 3 -> 4. Level 1 nodes must precede the level 2 node.
        Graph graph = emptyGraph(4);
        graph.addUndirectedEdge(1L, 2L, 5.0, 10.0);
        graph.addUndirectedEdge(1L, 3L, 5.0, 10.0);
        graph.addUndirectedEdge(3L, 4L, 5.0, 10.0);

        List<Long> visitOrder = new ArrayList<>(bfs.traverse(graph, 1L).getVisitedNodeIds());

        assertEquals(List.of(1L, 2L, 3L, 4L), visitOrder,
                "FIFO expansion must finish each level before starting the next");
    }

    @Test
    void traverse_everyVisitedNode_shouldHaveALevel() {
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(result.getVisitedNodeIds().size(), result.getDistanceLevels().size());
        assertTrue(result.getDistanceLevels().keySet().containsAll(result.getVisitedNodeIds()));
    }

    // ======================== BFS Tree / Path Reconstruction ========================

    @Test
    void traverse_parentMap_shouldReconstructThePathBackToStart() {
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        // Walk parents from the far end back to the root.
        List<Long> path = new ArrayList<>();
        Long cursor = 4L;
        while (cursor != null) {
            path.add(cursor);
            cursor = result.getParentMap().get(cursor);
        }

        assertEquals(List.of(4L, 3L, 2L, 1L), path);
    }

    @Test
    void traverse_parentMap_shouldExcludeStartNodeAndCoverEveryOtherVisitedNode() {
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertFalse(result.getParentMap().containsKey(1L), "the root has no parent");
        assertEquals(result.getVisitedNodeIds().size() - 1, result.getParentMap().size(),
                "every visited node except the root should have exactly one parent");
    }

    // ======================== Metrics ========================

    @Test
    void traverse_shouldReportNodesVisitedMatchingTheVisitedSet() {
        Graph graph = chainGraph(4);

        TraversalResult result = bfs.traverse(graph, 1L);

        assertEquals(result.getVisitedNodeIds().size(), result.getNodesVisited());
    }

    @Test
    void traverse_shouldRecordExecutionTime() {
        Graph graph = chainGraph(4);

        assertTrue(bfs.traverse(graph, 1L).getExecutionTimeNanos() > 0,
                "execution time should be measured");
    }

    // ======================== Validation ========================

    @Test
    void traverse_nullGraph_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> bfs.traverse(null, 1L));
    }

    @Test
    void traverse_nullStartNodeId_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> bfs.traverse(emptyGraph(2), null));
    }

    @Test
    void traverse_startNodeNotInGraph_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> bfs.traverse(emptyGraph(2), 99L));
    }

    // ======================== Helpers ========================

    /** Builds a graph holding {@code count} nodes (ids 1..count) and no roads. */
    private static Graph emptyGraph(int count) {
        Graph graph = new Graph();
        for (long id = 1; id <= count; id++) {
            NodeType type = (id == 1) ? NodeType.HQ : NodeType.RESCUE_CAMP;
            graph.addNode(new Node(id, "Node " + id, 7.0 + id, 80.0 + id, type));
        }
        return graph;
    }

    /** Builds a straight chain of two-way roads: 1 - 2 - ... - count. */
    private static Graph chainGraph(int count) {
        Graph graph = emptyGraph(count);
        for (long id = 1; id < count; id++) {
            graph.addUndirectedEdge(id, id + 1, 5.0, 10.0);
        }
        return graph;
    }

    /** Closes a two-way road by blocking both of its directed carriageways. */
    private static void blockRoad(Graph graph, Long a, Long b) {
        directedEdge(graph, a, b).setBlocked(true);
        directedEdge(graph, b, a).setBlocked(true);
    }

    /**
     * Finds the directed edge from {@code sourceId} to {@code targetId}. The list returned by
     * {@code getNeighbors} is unmodifiable, but the Edge objects in it are mutable, which is how
     * a road gets closed after the graph is built.
     */
    private static Edge directedEdge(Graph graph, Long sourceId, Long targetId) {
        return graph.getNeighbors(sourceId).stream()
                .filter(edge -> edge.getTargetId().equals(targetId))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No edge " + sourceId + " -> " + targetId));
    }
}
