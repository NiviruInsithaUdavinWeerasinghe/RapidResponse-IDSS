package com.rapidresponse.network.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rapidresponse.network.algorithm.BreadthFirstSearch;
import com.rapidresponse.network.algorithm.DepthFirstSearch;
import com.rapidresponse.network.algorithm.TraversalResult;
import com.rapidresponse.network.datastructure.UnionFind;
import com.rapidresponse.network.dto.ComponentsResponse;
import com.rapidresponse.network.dto.ConnectivityResponse;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;

/**
 * Orchestrates graph loading from the database and executes network analysis algorithms
 * (BFS reachability, DFS components, Kruskal's MST, Union-Find connectivity).
 */
@Service
public class NetworkService {

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final BreadthFirstSearch bfs;
    private final DepthFirstSearch dfs;

    // Cached from the last MST computation for O(α(V)) connectivity checks.
    private UnionFind lastUnionFind;
    private Map<Long, Integer> lastNodeIdToIndex;
    private int lastComponentCount;

    public NetworkService(NodeRepository nodeRepository, EdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.bfs = new BreadthFirstSearch();
        this.dfs = new DepthFirstSearch();
    }

    /**
     * Runs BFS from the first HQ node and returns which camps are reachable vs isolated.
     */
    public ReachabilityResponse analyseReachability() {
        Graph graph = buildGraphWithAllEdges();

        // Find the HQ node to start BFS from.
        Long hqNodeId = findHqNodeId(graph);
        if (hqNodeId == null) {
            return ReachabilityResponse.builder()
                    .reachableCamps(new ArrayList<>())
                    .isolatedCamps(new ArrayList<>())
                    .totalReachable(0)
                    .executionTimeNanos(0)
                    .build();
        }

        TraversalResult result = bfs.traverse(graph, hqNodeId);

        Set<Long> reachableIds = result.getVisitedNodeIds();
        List<ReachabilityResponse.NodeInfo> reachableCamps = new ArrayList<>();
        List<ReachabilityResponse.NodeInfo> isolatedCamps = new ArrayList<>();

        for (Long nodeId : graph.getAllNodeIds()) {
            Node node = graph.getNode(nodeId);
            if (node.getNodeType() == NodeType.HQ) {
                continue;
            }

            int hopDistance = result.getDistanceLevels().getOrDefault(nodeId, -1);
            ReachabilityResponse.NodeInfo info = ReachabilityResponse.NodeInfo.builder()
                    .id(nodeId)
                    .name(node.getName())
                    .nodeType(node.getNodeType().name())
                    .hopDistance(hopDistance)
                    .build();

            if (reachableIds.contains(nodeId)) {
                reachableCamps.add(info);
            } else {
                isolatedCamps.add(info);
            }
        }

        return ReachabilityResponse.builder()
                .reachableCamps(reachableCamps)
                .isolatedCamps(isolatedCamps)
                .totalReachable(reachableCamps.size())
                .executionTimeNanos(result.getExecutionTimeNanos())
                .build();
    }

    /**
     * Runs DFS to discover all connected components in the network.
     */
    public ComponentsResponse analyseComponents() {
        Graph graph = buildGraphWithAllEdges();

        List<Set<Long>> rawComponents = dfs.findAllConnectedComponents(graph);

        List<ComponentsResponse.ComponentInfo> components = new ArrayList<>();
        for (int i = 0; i < rawComponents.size(); i++) {
            Set<Long> nodeIds = rawComponents.get(i);
            components.add(ComponentsResponse.ComponentInfo.builder()
                    .id(i + 1)
                    .nodeIds(nodeIds)
                    .size(nodeIds.size())
                    .build());
        }

        return ComponentsResponse.builder()
                .components(components)
                .totalComponents(components.size())
                .build();
    }

    /**
     * Runs Kruskal's MST on blocked edges to determine the minimum-cost set of roads to clear
     * in order to reconnect the network. Caches the UnionFind for connectivity queries.
     */
    public MstResponse computeMst() {
        List<NodeEntity> nodeEntities = nodeRepository.findAll();
        List<EdgeEntity> edgeEntities = edgeRepository.findAll();

        // Build node-id-to-index mapping for UnionFind.
        Map<Long, Integer> nodeIdToIndex = new HashMap<>();
        List<Long> indexToNodeId = new ArrayList<>();
        int idx = 0;
        for (NodeEntity node : nodeEntities) {
            nodeIdToIndex.put(node.getId(), idx);
            indexToNodeId.add(node.getId());
            idx++;
        }

        int nodeCount = nodeEntities.size();
        if (nodeCount == 0) {
            this.lastUnionFind = null;
            this.lastNodeIdToIndex = null;
            this.lastComponentCount = 0;
            return MstResponse.builder()
                    .roadsToClear(new ArrayList<>())
                    .totalCost(0.0)
                    .componentsReduced("from 0 to 0")
                    .build();
        }

        UnionFind uf = new UnionFind(nodeCount);
        for (EdgeEntity edge : edgeEntities) {
            if (!edge.isBlocked()) {
                int srcIdx = nodeIdToIndex.get(edge.getSourceId());
                int tgtIdx = nodeIdToIndex.get(edge.getTargetId());
                uf.union(srcIdx, tgtIdx);
            }
        }

        int componentsBefore = uf.getComponentCount();

        // Collect blocked edges and sort by distance (Kruskal's greedy choice).
        List<EdgeEntity> blockedEdges = edgeEntities.stream()
                .filter(EdgeEntity::isBlocked)
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());

        List<MstResponse.MstEdge> roadsToClear = new ArrayList<>();
        double totalCost = 0.0;

        // Kruskal's: add cheapest blocked edge that connects two different components.
        for (EdgeEntity edge : blockedEdges) {
            int srcIdx = nodeIdToIndex.get(edge.getSourceId());
            int tgtIdx = nodeIdToIndex.get(edge.getTargetId());

            if (uf.union(srcIdx, tgtIdx)) {
                roadsToClear.add(MstResponse.MstEdge.builder()
                        .sourceNodeId(edge.getSourceId())
                        .targetNodeId(edge.getTargetId())
                        .distanceKm(edge.getDistanceKm())
                        .travelTimeMins(edge.getTravelTimeMins())
                        .build());
                totalCost += edge.getDistanceKm();
            }
        }

        int componentsAfter = uf.getComponentCount();

        // Cache for fast connectivity-check endpoint.
        this.lastUnionFind = uf;
        this.lastNodeIdToIndex = nodeIdToIndex;
        this.lastComponentCount = componentsAfter;

        return MstResponse.builder()
                .roadsToClear(roadsToClear)
                .totalCost(totalCost)
                .componentsReduced("from " + componentsBefore + " to " + componentsAfter)
                .build();
    }

    /**
     * Uses the cached UnionFind from the last MST computation for O(α(V)) connectivity check.
     * Runs MST first if no cached data exists.
     */
    public ConnectivityResponse checkConnectivity(Long sourceNodeId, Long targetNodeId) {
        if (lastUnionFind == null || lastNodeIdToIndex == null) {
            computeMst();
        }

        if (lastNodeIdToIndex == null) {
            throw new IllegalArgumentException("Network is empty. Cannot check connectivity.");
        }

        Integer srcIdx = lastNodeIdToIndex.get(sourceNodeId);
        Integer tgtIdx = lastNodeIdToIndex.get(targetNodeId);

        if (srcIdx == null) {
            throw new IllegalArgumentException("Source node not found: " + sourceNodeId);
        }
        if (tgtIdx == null) {
            throw new IllegalArgumentException("Target node not found: " + targetNodeId);
        }

        boolean connected = lastUnionFind.connected(srcIdx, tgtIdx);

        return ConnectivityResponse.builder()
                .sourceNodeId(sourceNodeId)
                .targetNodeId(targetNodeId)
                .connected(connected)
                .totalComponents(lastComponentCount)
                .build();
    }

    /**
     * Builds a Graph with ALL edges (including blocked ones). BFS/DFS skip blocked edges
     * at traversal time via edge.isBlocked(), so the same graph can be re-analysed after
     * toggling road closures without rebuilding.
     */
    private Graph buildGraphWithAllEdges() {
        List<NodeEntity> nodeEntities = nodeRepository.findAll();
        List<EdgeEntity> edgeEntities = edgeRepository.findAll();

        Graph graph = new Graph();

        for (NodeEntity entity : nodeEntities) {
            graph.addNode(new Node(
                    entity.getId(),
                    entity.getName(),
                    entity.getLatitude(),
                    entity.getLongitude(),
                    entity.getNodeType()
            ));
        }

        for (EdgeEntity entity : edgeEntities) {
            if (!entity.isOneWay()) {
                Edge fwd = new Edge(entity.getSourceId(), entity.getTargetId(),
                        entity.getDistanceKm(), entity.getTravelTimeMins(), entity.isBlocked());
                Edge rev = new Edge(entity.getTargetId(), entity.getSourceId(),
                        entity.getDistanceKm(), entity.getTravelTimeMins(), entity.isBlocked());
                addEdgeDirectly(graph, fwd);
                addEdgeDirectly(graph, rev);
            } else {
                Edge edge = new Edge(entity.getSourceId(), entity.getTargetId(),
                        entity.getDistanceKm(), entity.getTravelTimeMins(), entity.isBlocked());
                addEdgeDirectly(graph, edge);
            }
        }

        return graph;
    }

    /**
     * Adds a pre-constructed Edge (with blocked flag) using the public addEdge API,
     * then transfers the blocked status.
     */
    private void addEdgeDirectly(Graph graph, Edge edge) {
        graph.addEdge(edge.getSourceId(), edge.getTargetId(),
                edge.getDistanceKm(), edge.getTravelTimeMins());

        // Transfer the blocked flag to the edge that was just added.
        if (edge.isBlocked()) {
            List<com.rapidresponse.shared.model.Edge> neighbors = new ArrayList<>(
                    graph.getNeighbors(edge.getSourceId()));
            // The last edge added is at the end of the internal list.
            // Since getNeighbors returns unmodifiable, we access the original via addEdge side effect.
            // Instead, find the matching edge and set blocked.
            graph.getNeighbors(edge.getSourceId()).stream()
                    .filter(e -> e.getTargetId().equals(edge.getTargetId()))
                    .reduce((first, second) -> second) // get the last one added
                    .ifPresent(e -> e.setBlocked(true));
        }
    }

    private Long findHqNodeId(Graph graph) {
        for (Long nodeId : graph.getAllNodeIds()) {
            if (graph.getNode(nodeId).getNodeType() == NodeType.HQ) {
                return nodeId;
            }
        }
        return null;
    }
}
