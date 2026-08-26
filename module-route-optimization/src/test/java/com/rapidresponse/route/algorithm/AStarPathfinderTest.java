package com.rapidresponse.route.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AStarPathfinderTest {

    private Graph graph;
    private AStarPathfinder aStar;
    private DijkstraPathfinder dijkstra;

    @BeforeEach
    void setUp() {
        graph = new Graph();
        aStar = new AStarPathfinder();
        dijkstra = new DijkstraPathfinder();
    }

    @Test
    void testHaversineHeuristic() {
        // Test known distance (approx 344 km between London and Paris)
        double lat1 = 51.5007;
        double lon1 = -0.1246;
        double lat2 = 48.8566;
        double lon2 = 2.3522;
        
        double dist = HaversineHeuristic.calculate(lat1, lon1, lat2, lon2);
        assertTrue(dist > 340 && dist < 350, "Distance should be approx 344km");
        
        // Distance to self should be 0
        assertEquals(0.0, HaversineHeuristic.calculate(lat1, lon1, lat1, lon1), 0.001);
    }

    @Test
    void testAStarVsDijkstra_SamePathFewerNodesExplored() {
        // Create a grid-like graph where A* can shine by heading towards the target
        // Coordinates: 
        // 1(0,0) - 2(0,1) - 3(0,2)
        // |        |        |
        // 4(1,0) - 5(1,1) - 6(1,2)
        // |        |        |
        // 7(2,0) - 8(2,1) - 9(2,2) -> Target
        
        // Note: 1 degree latitude is approx 111 km. 
        // We'll just use simple values for testing.
        
        graph.addNode(new Node(1L, 0.0, 0.0));
        graph.addNode(new Node(2L, 0.0, 1.0));
        graph.addNode(new Node(3L, 0.0, 2.0));
        graph.addNode(new Node(4L, 1.0, 0.0));
        graph.addNode(new Node(5L, 1.0, 1.0));
        graph.addNode(new Node(6L, 1.0, 2.0));
        graph.addNode(new Node(7L, 2.0, 0.0));
        graph.addNode(new Node(8L, 2.0, 1.0));
        graph.addNode(new Node(9L, 2.0, 2.0));
        
        // Add edges (using actual Haversine distance so heuristic is admissible)
        addEdgeBothWays(1L, 2L);
        addEdgeBothWays(2L, 3L);
        addEdgeBothWays(4L, 5L);
        addEdgeBothWays(5L, 6L);
        addEdgeBothWays(7L, 8L);
        addEdgeBothWays(8L, 9L);
        
        addEdgeBothWays(1L, 4L);
        addEdgeBothWays(4L, 7L);
        addEdgeBothWays(2L, 5L);
        addEdgeBothWays(5L, 8L);
        addEdgeBothWays(3L, 6L);
        addEdgeBothWays(6L, 9L);

        PathResult aStarResult = aStar.findShortestPath(graph, 1L, 9L);
        PathResult dijkstraResult = dijkstra.findShortestPath(graph, 1L, 9L);

        // 1. Same optimal path distance
        assertEquals(dijkstraResult.getTotalDistanceKm(), aStarResult.getTotalDistanceKm(), 0.001);
        
        // 2. Same exact path sequence
        assertEquals(dijkstraResult.getNodeSequence(), aStarResult.getNodeSequence());
        
        // 3. A* should explore fewer or equal nodes compared to Dijkstra
        assertTrue(aStarResult.getNodesExplored() <= dijkstraResult.getNodesExplored(), 
            "A* should explore fewer nodes (" + aStarResult.getNodesExplored() + ") than Dijkstra (" + dijkstraResult.getNodesExplored() + ")");
    }

    @Test
    void testDegenerateCase_FallbackToDijkstra() {
        // Nodes without coordinates default to 0.0, 0.0
        graph.addNode(new Node(1L));
        graph.addNode(new Node(2L));
        graph.addNode(new Node(3L));
        
        graph.addEdge(1L, new Edge(2L, 10.0, 10.0, false));
        graph.addEdge(2L, new Edge(3L, 10.0, 10.0, false));
        graph.addEdge(1L, new Edge(3L, 30.0, 30.0, false)); // worse direct path

        PathResult aStarResult = aStar.findShortestPath(graph, 1L, 3L);
        PathResult dijkstraResult = dijkstra.findShortestPath(graph, 1L, 3L);
        
        assertEquals(List.of(1L, 2L, 3L), aStarResult.getNodeSequence());
        assertEquals(dijkstraResult.getNodeSequence(), aStarResult.getNodeSequence());
        assertEquals(dijkstraResult.getTotalDistanceKm(), aStarResult.getTotalDistanceKm(), 0.001);
        
        // When heuristic is 0, they should explore essentially the same number of nodes
        assertEquals(dijkstraResult.getNodesExplored(), aStarResult.getNodesExplored());
    }

    @Test
    void testBlockedEdges() {
        graph.addNode(new Node(1L, 0.0, 0.0));
        graph.addNode(new Node(2L, 0.0, 1.0));
        graph.addNode(new Node(3L, 0.0, 2.0));

        // Direct path is blocked
        graph.addEdge(1L, new Edge(3L, 2.0, 2.0, true));
        // Alternate path
        graph.addEdge(1L, new Edge(2L, 5.0, 5.0, false));
        graph.addEdge(2L, new Edge(3L, 5.0, 5.0, false));

        PathResult result = aStar.findShortestPath(graph, 1L, 3L);

        assertEquals(List.of(1L, 2L, 3L), result.getNodeSequence());
        assertEquals(10.0, result.getTotalDistanceKm(), 0.001);
    }
    
    private void addEdgeBothWays(Long n1, Long n2) {
        Node node1 = graph.getNode(n1);
        Node node2 = graph.getNode(n2);
        
        double dist = HaversineHeuristic.calculate(node1.getLat(), node1.getLon(), node2.getLat(), node2.getLon());
        
        graph.addEdge(n1, new Edge(n2, dist, dist, false));
        graph.addEdge(n2, new Edge(n1, dist, dist, false));
    }
}
