package com.rapidresponse.route.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DijkstraPathfinderTest {

    private Graph graph;
    private DijkstraPathfinder pathfinder;

    @BeforeEach
    void setUp() {
        graph = new Graph();
        pathfinder = new DijkstraPathfinder();
    }

    @Test
    void testSingleEdgePath() {
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addEdge(1L, new Edge(2L, 5.0, 10.0, false));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 2L);

        assertFalse(result.getNodeSequence().isEmpty(), "Path should exist");
        assertEquals(List.of(1L, 2L), result.getNodeSequence());
        assertEquals(5.0, result.getTotalDistanceKm(), 0.001);
        assertEquals(10.0, result.getTotalTravelTimeMins(), 0.001);
        assertTrue(result.getNodesExplored() > 0);
    }

    @Test
    void testMultiHopPath() {
        // 1 -> 2 -> 4 (dist = 10)
        // 1 -> 3 -> 4 (dist = 8)
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addNode(new Node(3L));
        graph.addNode(new Node(4L));

        graph.addEdge(1L, new Edge(2L, 4.0, 4.0, false));
        graph.addEdge(2L, new Edge(4L, 6.0, 6.0, false));
        
        graph.addEdge(1L, new Edge(3L, 5.0, 5.0, false));
        graph.addEdge(3L, new Edge(4L, 3.0, 3.0, false));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 4L);

        assertEquals(List.of(1L, 3L, 4L), result.getNodeSequence());
        assertEquals(8.0, result.getTotalDistanceKm(), 0.001);
        assertEquals(8.0, result.getTotalTravelTimeMins(), 0.001);
    }

    @Test
    void testNoPathExists() {
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 2L);

        assertTrue(result.getNodeSequence().isEmpty(), "Path should not exist");
        assertEquals(0.0, result.getTotalDistanceKm(), 0.001);
    }

    @Test
    void testBlockedEdges() {
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addNode(new Node(3L));

        // Direct path is blocked
        graph.addEdge(1L, new Edge(3L, 2.0, 2.0, true));
        // Alternate path
        graph.addEdge(1L, new Edge(2L, 5.0, 5.0, false));
        graph.addEdge(2L, new Edge(3L, 5.0, 5.0, false));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 3L);

        assertEquals(List.of(1L, 2L, 3L), result.getNodeSequence());
        assertEquals(10.0, result.getTotalDistanceKm(), 0.001);
    }
    
    @Test
    void testGraphWithCycles() {
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addNode(new Node(3L));
        
        graph.addEdge(1L, new Edge(2L, 1.0, 1.0, false));
        graph.addEdge(2L, new Edge(3L, 1.0, 1.0, false));
        graph.addEdge(3L, new Edge(1L, 1.0, 1.0, false)); // cycle
        
        PathResult result = pathfinder.findShortestPath(graph, 1L, 3L);
        
        assertEquals(List.of(1L, 2L, 3L), result.getNodeSequence());
        assertEquals(2.0, result.getTotalDistanceKm(), 0.001);
    }

    @Test
    void testPerformanceTiming() {
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addEdge(1L, new Edge(2L, 5.0, 5.0, false));

        PathResult result = pathfinder.findShortestPath(graph, 1L, 2L);

        assertTrue(result.getExecutionTimeNanos() > 0, "Execution time should be greater than 0");
    }
}
