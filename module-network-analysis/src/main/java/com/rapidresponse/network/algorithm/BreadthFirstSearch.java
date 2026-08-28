package com.rapidresponse.network.algorithm;

import java.util.ArrayDeque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;

/**
 * Breadth-First Search traversal over the disaster-zone road network.
 *
 * <p><strong>Purpose:</strong> Discovers every node still reachable from the Central HQ (or any
 * other start location) over roads that are not blocked. Answers the operational question
 * "which rescue camps can we physically still drive to?" and, via
 * {@link TraversalResult#getDistanceLevels()}, "how many road hops away is each one?"</p>
 *
 * <p><strong>Algorithm:</strong> A FIFO {@link Queue} drives level-by-level expansion. The start
 * node is enqueued at level 0; each time a node is dequeued, its unvisited, non-blocked
 * neighbours are recorded at one level deeper and enqueued behind everything already waiting.
 * Because the queue is strictly first-in-first-out, all nodes at level <em>k</em> are dequeued
 * before any node at level <em>k+1</em>, which is what makes the recorded level the
 * <em>minimum</em> hop count to that node.</p>
 *
 * <p>A {@code visited} set is consulted before enqueuing, so each node enters the queue at most
 * once. Without it, a cyclic road network would loop forever.</p>
 *
 * <p><strong>Blocked roads:</strong> Edges flagged {@link Edge#isBlocked()} are skipped during
 * expansion rather than filtered out when the graph is built. That means the same {@link Graph}
 * instance can be re-traversed after toggling road closures — the caller does not have to rebuild
 * it — which is how the network-integrity screen re-runs the analysis as roads are cut.</p>
 *
 * <p><strong>Time Complexity:</strong> O(V + E) — every reachable node is dequeued once and every
 * outgoing edge of a dequeued node is examined once. <strong>Space Complexity:</strong> O(V) for
 * the queue, visited set, parent map, and level map.</p>
 *
 * <p><strong>Thread safety:</strong> Stateless and therefore safe to share; all traversal state
 * is local to {@link #traverse(Graph, Long)}.</p>
 */
public class BreadthFirstSearch {

    /**
     * Traverses the graph breadth-first from {@code startNodeId}, following only unblocked edges.
     *
     * @param graph       the road network to traverse
     * @param startNodeId the node to start from, typically the Central HQ
     * @return a {@link TraversalResult} holding the reachable set, the BFS tree, and hop levels
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

        // LinkedHashSet/LinkedHashMap so the results iterate in BFS visit order, which keeps
        // the traversal reproducible and readable when rendered on the network screen.
        Set<Long> visitedNodeIds = new LinkedHashSet<>();
        Map<Long, Long> parentMap = new LinkedHashMap<>();
        Map<Long, Integer> distanceLevels = new LinkedHashMap<>();

        Queue<Long> queue = new ArrayDeque<>();

        // Seed the traversal: the start node is visited, sits at level 0, and has no parent.
        visitedNodeIds.add(startNodeId);
        distanceLevels.put(startNodeId, 0);
        queue.add(startNodeId);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            int neighbourLevel = distanceLevels.get(currentId) + 1;

            for (Edge edge : graph.getNeighbors(currentId)) {
                // A collapsed road is not traversable, even though it is still in the graph.
                if (edge.isBlocked()) {
                    continue;
                }

                Long neighbourId = edge.getTargetId();

                // add() returns false when the node was already discovered, which both prevents
                // re-exploration and keeps the first (shortest) level recorded for that node.
                if (!visitedNodeIds.add(neighbourId)) {
                    continue;
                }

                parentMap.put(neighbourId, currentId);
                distanceLevels.put(neighbourId, neighbourLevel);
                queue.add(neighbourId);
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
}
