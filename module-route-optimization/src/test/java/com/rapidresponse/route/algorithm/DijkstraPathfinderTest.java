package com.rapidresponse.route.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;

class DijkstraPathfinderTest {

    private final DijkstraPathfinder pathfinder = new DijkstraPathfinder();

    @Test
    void findsSingleEdgePathAndAccumulatesMetrics() {
        Graph graph = graph(node(1L, "A"), node(2L, "B"));
        graph.addEdge(1L, 2L, 4.5, 7.0);

        PathResult result = pathfinder.findShortestPath(graph, 1L, 2L);

        assertEquals(PathResult.STATUS_SUCCESS, result.getStatus());
        assertEquals(List.of(1L, 2L), result.getNodeSequence());
        assertEquals(4.5, result.getTotalDistanceKm());
        assertEquals(7.0, result.getTotalTravelTimeMins());
        assertEquals(2, result.getNodesExplored());
    }

    @Test
    void findsMultiHopShortestPathInsteadOfDirectLongerEdge() {
        Graph graph = graph(node(1L, "A"), node(2L, "B"), node(3L, "C"));
        graph.addEdge(1L, 2L, 3.0, 5.0);
        graph.addEdge(2L, 3L, 2.0, 4.0);
        graph.addEdge(1L, 3L, 10.0, 1.0);

        PathResult result = pathfinder.findShortestPath(graph, 1L, 3L);

        assertEquals(List.of(1L, 2L, 3L), result.getNodeSequence());
        assertEquals(5.0, result.getTotalDistanceKm());
        assertEquals(9.0, result.getTotalTravelTimeMins());
    }

    @Test
    void ignoresBlockedEdgesAndReportsNoPathWhenTheyAreTheOnlyRoute() {
        Graph graph = graph(node(1L, "A"), node(2L, "B"));
        graph.addEdge(1L, 2L, 1.0, 1.0);
        graph.getNeighbors(1L).get(0).setBlocked(true);

        PathResult result = pathfinder.findShortestPath(graph, 1L, 2L);

        assertEquals(PathResult.STATUS_NO_PATH, result.getStatus());
        assertTrue(result.getNodeSequence().isEmpty());
        assertEquals(1, result.getNodesExplored());
    }

    @Test
    void returnsNoPathForDisconnectedNodes() {
        Graph graph = graph(node(1L, "A"), node(2L, "B"), node(3L, "C"));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 3L);

        assertEquals(PathResult.STATUS_NO_PATH, result.getStatus());
        assertTrue(result.getNodeSequence().isEmpty());
    }

    @Test
    void returnsSelfPathWhenSourceEqualsTarget() {
        Graph graph = graph(node(1L, "A"));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 1L);

        assertEquals(List.of(1L), result.getNodeSequence());
        assertEquals(0.0, result.getTotalDistanceKm());
    }

    @Test
    void terminatesOnCyclesAndReturnsTheShortestPath() {
        Graph graph = graph(node(1L, "A"), node(2L, "B"), node(3L, "C"));
        graph.addUndirectedEdge(1L, 2L, 1.0, 1.0);
        graph.addUndirectedEdge(2L, 3L, 2.0, 2.0);

        PathResult result = pathfinder.findShortestPath(graph, 1L, 3L);

        assertEquals(List.of(1L, 2L, 3L), result.getNodeSequence());
        assertEquals(3.0, result.getTotalDistanceKm());
        assertTrue(result.getExecutionTimeNanos() > 0);
    }

    private static Graph graph(Node... nodes) {
        Graph graph = new Graph();
        for (Node node : nodes) {
            graph.addNode(node);
        }
        return graph;
    }

    private static Node node(Long id, String name) {
        return new Node(id, name, 0.0, 0.0, NodeType.INTERSECTION);
    }
}
