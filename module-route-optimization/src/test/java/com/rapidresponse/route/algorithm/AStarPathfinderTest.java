package com.rapidresponse.route.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;

class AStarPathfinderTest {

    private final AStarPathfinder pathfinder = new AStarPathfinder();
    private final DijkstraPathfinder dijkstra = new DijkstraPathfinder();

    @Test
    void findsTheSameShortestPathAsDijkstra() {
        Graph graph = kandyLikeGraph();

        PathResult astar = pathfinder.findShortestPath(graph, 1L, 4L);
        PathResult dik = dijkstra.findShortestPath(graph, 1L, 4L);

        assertEquals(PathResult.STATUS_SUCCESS, astar.getStatus());
        assertEquals(dik.getNodeSequence(), astar.getNodeSequence());
        assertEquals(dik.getTotalDistanceKm(), astar.getTotalDistanceKm(), 1e-9);
        assertEquals(List.of(1L, 3L, 4L), astar.getNodeSequence());
    }

    @Test
    void returnsEmptyPathWhenTargetIsUnreachable() {
        Graph graph = kandyLikeGraph();

        PathResult result = pathfinder.findShortestPath(graph, 1L, 5L);

        assertEquals(PathResult.STATUS_NO_PATH, result.getStatus());
        assertTrue(result.getNodeSequence().isEmpty());
    }

    @Test
    void exploresFewerOrEqualNodesThanDijkstraOnAGeographicGraph() {
        Graph graph = kandyLikeGraph();

        PathResult astar = pathfinder.findShortestPath(graph, 1L, 4L);
        PathResult dik = dijkstra.findShortestPath(graph, 1L, 4L);

        assertTrue(astar.getNodesExplored() <= dik.getNodesExplored());
    }

    private static Graph kandyLikeGraph() {
        Graph graph = new Graph();
        graph.addNode(new Node(1L, "HQ", 7.2906, 80.6337, NodeType.HQ));
        graph.addNode(new Node(2L, "North Junction", 7.3356, 80.6214, NodeType.INTERSECTION));
        graph.addNode(new Node(3L, "Peradeniya Camp", 7.2699, 80.5938, NodeType.RESCUE_CAMP));
        graph.addNode(new Node(4L, "Gampola Camp", 7.1647, 80.5696, NodeType.RESCUE_CAMP));
        graph.addNode(new Node(5L, "Isolated Lookout", 7.4000, 80.7000, NodeType.INTERSECTION));

        graph.addUndirectedEdge(1L, 2L, 8.0, 16.0);
        graph.addUndirectedEdge(2L, 3L, 12.0, 24.0);
        graph.addUndirectedEdge(1L, 3L, 10.0, 20.0);
        graph.addUndirectedEdge(3L, 4L, 15.0, 30.0);
        graph.addUndirectedEdge(2L, 4L, 28.0, 50.0);
        return graph;
    }
}
