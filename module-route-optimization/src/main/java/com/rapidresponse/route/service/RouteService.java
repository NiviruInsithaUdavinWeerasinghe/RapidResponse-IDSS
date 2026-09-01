package com.rapidresponse.route.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.rapidresponse.network.service.NetworkService;
import com.rapidresponse.route.algorithm.AStarPathfinder;
import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.route.dto.request.RouteRequest;
import com.rapidresponse.route.dto.response.NeighborResponse;
import com.rapidresponse.route.dto.response.NodeResponse;
import com.rapidresponse.route.dto.response.RouteCompareResponse;
import com.rapidresponse.route.dto.response.RouteResponse;
import com.rapidresponse.route.model.GraphBuilder;
import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.Edge;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;

@Service
public class RouteService {

    public static final String ALGORITHM_DIJKSTRA = "dijkstra";
    public static final String ALGORITHM_ASTAR = "astar";
    public static final String MSG_DIFFERENT_COMPONENTS = "Nodes are in different network components; no path exists.";

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final GraphBuilder graphBuilder;
    private final DijkstraPathfinder dijkstraPathfinder;
    private final AStarPathfinder aStarPathfinder;
    private final Optional<NetworkService> networkService;

    public RouteService(NodeRepository nodeRepository,
                        EdgeRepository edgeRepository,
                        GraphBuilder graphBuilder,
                        DijkstraPathfinder dijkstraPathfinder,
                        AStarPathfinder aStarPathfinder) {
        this(nodeRepository, edgeRepository, graphBuilder, dijkstraPathfinder, aStarPathfinder, Optional.empty());
    }

    public RouteService(NodeRepository nodeRepository,
                        EdgeRepository edgeRepository,
                        GraphBuilder graphBuilder,
                        DijkstraPathfinder dijkstraPathfinder,
                        AStarPathfinder aStarPathfinder,
                        NetworkService networkService) {
        this(nodeRepository, edgeRepository, graphBuilder, dijkstraPathfinder, aStarPathfinder, Optional.ofNullable(networkService));
    }

    @Autowired
    public RouteService(NodeRepository nodeRepository,
                        EdgeRepository edgeRepository,
                        GraphBuilder graphBuilder,
                        DijkstraPathfinder dijkstraPathfinder,
                        AStarPathfinder aStarPathfinder,
                        Optional<NetworkService> networkService) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.graphBuilder = graphBuilder;
        this.dijkstraPathfinder = dijkstraPathfinder;
        this.aStarPathfinder = aStarPathfinder;
        this.networkService = networkService != null ? networkService : Optional.empty();
    }

    public RouteResponse findDijkstra(RouteRequest request) {
        return runPathfinder(request, ALGORITHM_DIJKSTRA);
    }

    public RouteResponse findAstar(RouteRequest request) {
        return runPathfinder(request, ALGORITHM_ASTAR);
    }

    public RouteCompareResponse compare(RouteRequest request) {
        RouteResponse dijkstra = findDijkstra(request);
        RouteResponse astar = findAstar(request);
        boolean samePath = Objects.equals(
                dijkstra.pathResult().getNodeSequence(),
                astar.pathResult().getNodeSequence()
        );
        int delta = dijkstra.pathResult().getNodesExplored() - astar.pathResult().getNodesExplored();
        return new RouteCompareResponse(dijkstra, astar, samePath, delta);
    }

    public List<NodeResponse> listNodes() {
        return nodeRepository.findAll().stream()
                .map(this::toNodeResponse)
                .toList();
    }

    public List<NeighborResponse> listNeighbors(Long nodeId) {
        requireNode(nodeId);
        List<NeighborResponse> neighbors = new ArrayList<>();
        List<EdgeEntity> edges = edgeRepository.findAll();
        for (EdgeEntity edge : edges) {
            if (edge.getSourceId().equals(nodeId) || edge.getTargetId().equals(nodeId)) {
                Long targetId = edge.getSourceId().equals(nodeId) ? edge.getTargetId() : edge.getSourceId();
                NodeEntity neighbor = nodeRepository.findById(targetId).orElse(null);
                if (neighbor != null) {
                    neighbors.add(new NeighborResponse(
                            neighbor.getId(),
                            neighbor.getName(),
                            neighbor.getLatitude(),
                            neighbor.getLongitude(),
                            edge.getDistanceKm(),
                            edge.getTravelTimeMins(),
                            edge.isBlocked()
                    ));
                }
            }
        }
        return neighbors;
    }

    private RouteResponse runPathfinder(RouteRequest request, String algorithm) {
        requireNode(request.sourceId());
        requireNode(request.targetId());

        long startTime = System.nanoTime();
        Graph graph = loadGraph();

        // Reachability Pre-Check via Module 3's UnionFind (Issue #28)
        if (networkService.isPresent()) {
            Boolean connected = networkService.get().isReachablePreCheck(request.sourceId(), request.targetId());
            if (Boolean.FALSE.equals(connected)) {
                PathResult disconnectedResult = PathResult.builder()
                        .status(PathResult.STATUS_NO_PATH)
                        .nodeSequence(Collections.emptyList())
                        .totalDistanceKm(Double.POSITIVE_INFINITY)
                        .totalTravelTimeMins(Double.POSITIVE_INFINITY)
                        .nodesExplored(0)
                        .executionTimeNanos(System.nanoTime() - startTime)
                        .message(MSG_DIFFERENT_COMPONENTS)
                        .build();
                return new RouteResponse(algorithm, disconnectedResult, Collections.emptyList(),
                        graph.getNodeCount(), graph.getEdgeCount());
            }
        }

        PathResult result = ALGORITHM_DIJKSTRA.equals(algorithm)
                ? dijkstraPathfinder.findShortestPath(graph, request.sourceId(), request.targetId())
                : aStarPathfinder.findShortestPath(graph, request.sourceId(), request.targetId());

        List<String> names = result.getNodeSequence().stream()
                .map(id -> {
                    Node node = graph.getNode(id);
                    return node == null ? String.valueOf(id) : node.getName();
                })
                .toList();

        return new RouteResponse(algorithm, result, names, graph.getNodeCount(), graph.getEdgeCount());
    }

    private Graph loadGraph() {
        List<NodeEntity> nodes = nodeRepository.findAll();
        List<EdgeEntity> edges = edgeRepository.findAll();
        return graphBuilder.build(nodes, edges);
    }

    private void requireNode(Long nodeId) {
        if (!nodeRepository.existsById(nodeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found with id: " + nodeId);
        }
    }

    private NodeResponse toNodeResponse(NodeEntity entity) {
        return new NodeResponse(
                entity.getId(),
                entity.getName(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getNodeType()
        );
    }
}
