package com.rapidresponse.route.algorithm;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;

/**
 * Synthetic Scalability Benchmark
 * This test generates large grid graphs to empirically prove the scalability 
 * of A* compared to Dijkstra as discussed in the project report (Chapter 8).
 * 
 * Note: @Disabled by default to prevent slowing down the CI/CD build, 
 * but can be run manually to verify the nanosecond benchmarks.
 */
public class ScalabilityBenchmarkTest {

    private final AStarPathfinder astar = new AStarPathfinder();
    private final DijkstraPathfinder dijkstra = new DijkstraPathfinder();

    @Test
    @Disabled("Manual benchmark test")
    void benchmarkSmallGraph() {
        runBenchmark(10, "Small (100 nodes)");
    }

    @Test
    @Disabled("Manual benchmark test")
    void benchmarkMediumGraph() {
        runBenchmark(50, "Medium (2,500 nodes)");
    }

    @Test
    @Disabled("Manual benchmark test")
    void benchmarkLargeGraph() {
        runBenchmark(158, "Large (~25,000 nodes)");
    }

    private void runBenchmark(int gridSize, String label) {
        Graph graph = generateGridGraph(gridSize);
        Long sourceId = 1L;
        Long targetId = (long) (gridSize * gridSize);

        // Warmup
        dijkstra.findShortestPath(graph, sourceId, targetId);
        astar.findShortestPath(graph, sourceId, targetId);

        // Actual Run
        PathResult dikResult = dijkstra.findShortestPath(graph, sourceId, targetId);
        PathResult astarResult = astar.findShortestPath(graph, sourceId, targetId);

        System.out.println("=== Benchmark: " + label + " ===");
        System.out.println("Dijkstra - Nodes Explored: " + dikResult.getNodesExplored() + " | Time (ms): " + (dikResult.getExecutionTimeNanos() / 1_000_000.0));
        System.out.println("A*       - Nodes Explored: " + astarResult.getNodesExplored() + " | Time (ms): " + (astarResult.getExecutionTimeNanos() / 1_000_000.0));
        System.out.println("====================================\n");
    }

    private Graph generateGridGraph(int size) {
        Graph graph = new Graph();
        long idCounter = 1;

        // Create nodes
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                double lat = 7.0 + (row * 0.01);
                double lon = 80.0 + (col * 0.01);
                NodeType type = (row == 0 && col == 0) ? NodeType.HQ :
                                (row == size - 1 && col == size - 1) ? NodeType.RESCUE_CAMP : NodeType.INTERSECTION;
                graph.addNode(new Node(idCounter++, "GridNode", lat, lon, type));
            }
        }

        // Create edges (grid connections)
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                long currentId = (row * size) + col + 1;
                
                // Right neighbor
                if (col < size - 1) {
                    long rightId = currentId + 1;
                    graph.addUndirectedEdge(currentId, rightId, 1.1, 2.0);
                }
                
                // Bottom neighbor
                if (row < size - 1) {
                    long bottomId = currentId + size;
                    graph.addUndirectedEdge(currentId, bottomId, 1.1, 2.0);
                }
            }
        }
        return graph;
    }
}
