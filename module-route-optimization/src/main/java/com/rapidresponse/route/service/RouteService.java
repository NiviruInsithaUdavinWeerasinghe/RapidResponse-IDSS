package com.rapidresponse.route.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final GraphBuilder graphBuilder;
    private final DijkstraPathfinder dijkstraPathfinder;
    private final AStarPathfinder aStarPathfinder;

    public RouteService(NodeRepository nodeRepository,
                        EdgeRepository edgeRepository,
                        GraphBuilder graphBuilder,
                        DijkstraPathfinder dijkstraPathfinder,
                        AStarPathfinder aStarPathfinder) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.graphBuilder = graphBuilder;
        this.dijkstraPathfinder = dijkstraPathfinder;
        this.aStarPathfinder = aStarPathfinder;
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

        Graph graph = loadGraph();
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
