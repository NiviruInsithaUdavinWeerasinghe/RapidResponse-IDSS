package com.rapidresponse.network.algorithm;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;

/**
 * Depth-First Search traversal over the disaster-zone road network.
 *
 * <p>Discovers connected components and detects isolated rescue camps by exploring
 * as deep as possible along each branch before backtracking. Uses an explicit
 * {@link Deque} as a LIFO stack instead of recursion to avoid stack overflow on
 * large graphs.</p>
 *
 * <p><strong>Time Complexity:</strong> O(V + E).
 * <strong>Space Complexity:</strong> O(V).</p>
 *
 * <p><strong>Thread safety:</strong> Stateless; all traversal state is local to
 * each method call.</p>
 */
public class DepthFirstSearch {

    /**
     * Traverses the graph depth-first from {@code startNodeId}, following only unblocked edges.
     *
     * @param graph       the road network to traverse
     * @param startNodeId the node to start from
     * @return a {@link TraversalResult} holding the reachable set, the DFS tree, and depth levels
     * @throws IllegalArgumentException if the graph is null, the start id is null, or the start
     *                                  node is not present in the graph
     */
    public TraversalResult traverse(Graph graph, Long startNodeId) {
        if (graph == null) {
            throw new IllegalArgumentException("Graph cannot be null");
        }
        if (startNodeId == null) {
            throw new IllegalArgumentException("Start node id cannot be null");
        }
        if (graph.getNode(startNodeId) == null) {
            throw new IllegalArgumentException("Start node not found in graph: " + startNodeId);
        }

        long startTime = System.nanoTime();

        Set<Long> visitedNodeIds = new LinkedHashSet<>();
        Map<Long, Long> parentMap = new LinkedHashMap<>();
        Map<Long, Integer> distanceLevels = new LinkedHashMap<>();

        Deque<StackFrame> stack = new ArrayDeque<>();

        // Seed: start node at depth 0 with no parent.
        stack.push(new StackFrame(startNodeId, 0, null));

        while (!stack.isEmpty()) {
            StackFrame frame = stack.pop();

            if (!visitedNodeIds.add(frame.nodeId)) {
                continue;
            }

            distanceLevels.put(frame.nodeId, frame.depth);
            if (frame.parentId != null) {
                parentMap.put(frame.nodeId, frame.parentId);
            }

            // Push unvisited, unblocked neighbours onto the stack.
            for (Edge edge : graph.getNeighbors(frame.nodeId)) {
                if (edge.isBlocked()) {
                    continue;
                }
                if (!visitedNodeIds.contains(edge.getTargetId())) {
                    stack.push(new StackFrame(edge.getTargetId(), frame.depth + 1, frame.nodeId));
                }
            }
        }

        return TraversalResult.builder()
                .visitedNodeIds(visitedNodeIds)
                .parentMap(parentMap)
                .distanceLevels(distanceLevels)
                .nodesVisited(visitedNodeIds.size())
                .executionTimeNanos(System.nanoTime() - startTime)
                .build();
    }

    /**
     * Discovers all connected components in the graph by running DFS from each unvisited node.
     * Blocked edges are skipped, so a road closure can split a single physical network into
     * multiple logical components.
     *
     * @param graph the road network to analyse
     * @return components sorted by size descending; the first element is the main reachable network
     * @throws IllegalArgumentException if the graph is null
     */
    public List<Set<Long>> findAllConnectedComponents(Graph graph) {
        if (graph == null) {
            throw new IllegalArgumentException("Graph cannot be null");
        }

        Set<Long> globalVisited = new LinkedHashSet<>();
        List<Set<Long>> components = new ArrayList<>();

        for (Long nodeId : graph.getAllNodeIds()) {
            if (globalVisited.contains(nodeId)) {
                continue;
            }

            TraversalResult result = traverse(graph, nodeId);
            Set<Long> component = result.getVisitedNodeIds();
            globalVisited.addAll(component);
            components.add(component);
        }

        // Largest component first — the main reachable network.
        components.sort((a, b) -> Integer.compare(b.size(), a.size()));

        return components;
    }

    // Lightweight record to hold stack frames without recursion.
    private static final class StackFrame {
        final Long nodeId;
        final int depth;
        final Long parentId;

        StackFrame(Long nodeId, int depth, Long parentId) {
            this.nodeId = nodeId;
            this.depth = depth;
            this.parentId = parentId;
        }
    }
}
