package com.rapidresponse.route.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Test;

class DijkstraPathfinderTest {
    private final DijkstraPathfinder pathfinder = new DijkstraPathfinder();

    @Test
    void findsSingleEdgePathAndAccumulatesMetrics() {
        Node source = node("A");
        Node target = node("B");
        Graph graph = graph(source, target);
        graph.addEdge(source, new Edge(target, 4.5, 7.0, false));

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertSuccess(result, List.of("A", "B"));
        assertEquals(4.5, result.getTotalDistance());
        assertEquals(7.0, result.getTotalTravelTime());
        assertEquals(2, result.getNodesExplored());
    }

    @Test
    void findsMultiHopShortestPathAndBacktracksParentsInOrder() {
        Node source = node("A");
        Node middle = node("B");
        Node target = node("C");
        Graph graph = graph(source, middle, target);
        graph.addEdge(source, new Edge(middle, 3.0, 5.0, false));
        graph.addEdge(middle, new Edge(target, 2.0, 4.0, false));
        graph.addEdge(source, new Edge(target, 10.0, 1.0, false));

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertSuccess(result, List.of("A", "B", "C"));
        assertEquals(5.0, result.getTotalDistance());
        assertEquals(9.0, result.getTotalTravelTime());
    }

    @Test
    void ignoresBlockedEdgesAndReportsNoPathWhenTheyAreTheOnlyRoute() {
        Node source = node("A");
        Node target = node("B");
        Graph graph = graph(source, target);
        graph.addEdge(source, new Edge(target, 1.0, 1.0, true));

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertEquals("NO_PATH_FOUND", result.getStatus());
        assertTrue(result.getPath().isEmpty());
        assertEquals(Double.POSITIVE_INFINITY, result.getTotalDistance());
        assertEquals(1, result.getNodesExplored());
    }

    @Test
    void returnsNoPathForDisconnectedNodes() {
        Node source = node("A");
        Node target = node("C");
        Graph graph = graph(source, node("B"), target);

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertEquals("NO_PATH_FOUND", result.getStatus());
        assertTrue(result.getPath().isEmpty());
        assertEquals(1, result.getNodesExplored());
    }

    @Test
    void terminatesOnCyclesAndReturnsTheShortestCycleSafePath() {
        Node source = node("A");
        Node middle = node("B");
        Node target = node("C");
        Graph graph = graph(source, middle, target);
        graph.addEdge(source, new Edge(middle, 1.0, 1.0, false));
        graph.addEdge(middle, new Edge(source, 1.0, 1.0, false));
        graph.addEdge(middle, new Edge(target, 2.0, 2.0, false));
        graph.addEdge(target, new Edge(middle, 1.0, 1.0, false));

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertSuccess(result, List.of("A", "B", "C"));
        assertEquals(3.0, result.getTotalDistance());
    }

    @Test
    void recordsExecutionTimeAndCompletesARepresentativeGraphPromptly() {
        Node source = node("0");
        Node target = node("100");
        Graph graph = graph(source, target);
        List<Node> nodes = IntStream.range(1, 100).mapToObj(value -> node(String.valueOf(value))).toList();
        nodes.forEach(graph::addNode);
        Node previous = source;
        for (Node node : nodes) {
            graph.addEdge(previous, new Edge(node, 1.0, 1.0, false));
            previous = node;
        }
        graph.addEdge(previous, new Edge(target, 1.0, 1.0, false));

        PathResult result = pathfinder.findShortestPath(graph, source, target);

        assertSuccess(result, 101);
        assertTrue(result.getExecutionTimeNanos() > 0);
        assertTrue(result.getExecutionTimeNanos() < 1_000_000_000L);
    }

    private static void assertSuccess(PathResult result, List<String> expectedPath) {
        assertEquals("SUCCESS", result.getStatus());
        assertEquals(expectedPath, result.getPath());
        assertFalse(result.getPath().isEmpty());
    }

    private static void assertSuccess(PathResult result, int expectedPathLength) {
        assertEquals("SUCCESS", result.getStatus());
        assertEquals(expectedPathLength, result.getPath().size());
    }

    private static Graph graph(Node... nodes) {
        Graph graph = new Graph();
        for (Node node : nodes) {
            graph.addNode(node);
        }
        return graph;
    }

    private static Node node(String id) {
        return new Node(id);
    }
}