package com.rapidresponse.route.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private NodeRepository nodeRepository;

    @Mock
    private EdgeRepository edgeRepository;

    @Mock
    private GraphBuilder graphBuilder;

    @Mock
    private DijkstraPathfinder dijkstraPathfinder;

    @Mock
    private AStarPathfinder aStarPathfinder;

    @Mock
    private NetworkService networkService;

    private RouteService routeServiceWithNetwork;
    private RouteService routeServiceWithoutNetwork;

    @BeforeEach
    void setUp() {
        routeServiceWithNetwork = new RouteService(
                nodeRepository, edgeRepository, graphBuilder,
                dijkstraPathfinder, aStarPathfinder, networkService
        );

        routeServiceWithoutNetwork = new RouteService(
                nodeRepository, edgeRepository, graphBuilder,
                dijkstraPathfinder, aStarPathfinder
        );
    }

    private void mockNodeExists(Long... ids) {
        for (Long id : ids) {
            when(nodeRepository.existsById(id)).thenReturn(true);
        }
    }

    private Graph createMockGraph() {
        Graph graph = new Graph();
        graph.addNode(new Node(1L, "HQ", 6.9271, 79.8612, NodeType.HQ));
        graph.addNode(new Node(2L, "Camp A", 6.9300, 79.8700, NodeType.RESCUE_CAMP));
        graph.addNode(new Node(3L, "Isolated Camp", 7.5000, 80.5000, NodeType.RESCUE_CAMP));
        return graph;
    }

    @Test
    @DisplayName("Issue #28: Pre-check rejects path instantly when nodes are in different components")
    void findDijkstra_differentComponents_shouldRejectInstantlyWithoutRunningPathfinder() {
        mockNodeExists(1L, 3L);
        when(networkService.isReachablePreCheck(1L, 3L)).thenReturn(false);
        when(graphBuilder.build(anyList(), anyList())).thenReturn(createMockGraph());

        RouteRequest request = new RouteRequest(1L, 3L);
        RouteResponse response = routeServiceWithNetwork.findDijkstra(request);

        assertNotNull(response);
        assertEquals(RouteService.ALGORITHM_DIJKSTRA, response.algorithm());
        PathResult result = response.pathResult();
        assertEquals(PathResult.STATUS_NO_PATH, result.getStatus());
        assertEquals(Double.POSITIVE_INFINITY, result.getTotalDistanceKm());
        assertEquals(Double.POSITIVE_INFINITY, result.getTotalTravelTimeMins());
        assertEquals(0, result.getNodesExplored());
        assertTrue(result.getNodeSequence().isEmpty());
        assertEquals(RouteService.MSG_DIFFERENT_COMPONENTS, result.getMessage());

        // Verify Dijkstra algorithm was NOT invoked at all (instant O(alpha(V)) rejection)
        verify(dijkstraPathfinder, never()).findShortestPath(any(), any(), any());
    }

    @Test
    @DisplayName("Issue #28: A* pre-check rejects path instantly when nodes are in different components")
    void findAstar_differentComponents_shouldRejectInstantly() {
        mockNodeExists(1L, 3L);
        when(networkService.isReachablePreCheck(1L, 3L)).thenReturn(false);
        when(graphBuilder.build(anyList(), anyList())).thenReturn(createMockGraph());

        RouteRequest request = new RouteRequest(1L, 3L);
        RouteResponse response = routeServiceWithNetwork.findAstar(request);

        assertNotNull(response);
        assertEquals(RouteService.ALGORITHM_ASTAR, response.algorithm());
        PathResult result = response.pathResult();
        assertEquals(PathResult.STATUS_NO_PATH, result.getStatus());
        assertEquals(RouteService.MSG_DIFFERENT_COMPONENTS, result.getMessage());

        verify(aStarPathfinder, never()).findShortestPath(any(), any(), any());
    }

    @Test
    @DisplayName("Issue #28: Connected nodes execute standard pathfinding when pre-check succeeds")
    void findDijkstra_connectedNodes_shouldExecutePathfinder() {
        mockNodeExists(1L, 2L);
        when(networkService.isReachablePreCheck(1L, 2L)).thenReturn(true);

        Graph graph = createMockGraph();
        when(graphBuilder.build(anyList(), anyList())).thenReturn(graph);

        PathResult expectedPath = PathResult.success(List.of(1L, 2L), 5.2, 8.0, 2, 100_000L);
        when(dijkstraPathfinder.findShortestPath(graph, 1L, 2L)).thenReturn(expectedPath);

        RouteRequest request = new RouteRequest(1L, 2L);
        RouteResponse response = routeServiceWithNetwork.findDijkstra(request);

        assertEquals(PathResult.STATUS_SUCCESS, response.pathResult().getStatus());
        assertEquals(5.2, response.pathResult().getTotalDistanceKm(), 1e-9);
        assertEquals(List.of(1L, 2L), response.pathResult().getNodeSequence());
        assertEquals(List.of("HQ", "Camp A"), response.nodeNames());
        verify(dijkstraPathfinder).findShortestPath(graph, 1L, 2L);
    }

    @Test
    @DisplayName("Issue #28: Gracefully falls back to running pathfinder when UnionFind is uninitialized (Module 3 hasn't run)")
    void findDijkstra_uninitializedUnionFind_shouldFallbackToPathfinder() {
        mockNodeExists(1L, 2L);
        when(networkService.isReachablePreCheck(1L, 2L)).thenReturn(null); // Uninitialized

        Graph graph = createMockGraph();
        when(graphBuilder.build(anyList(), anyList())).thenReturn(graph);

        PathResult expectedPath = PathResult.success(List.of(1L, 2L), 5.2, 8.0, 2, 100_000L);
        when(dijkstraPathfinder.findShortestPath(graph, 1L, 2L)).thenReturn(expectedPath);

        RouteRequest request = new RouteRequest(1L, 2L);
        RouteResponse response = routeServiceWithNetwork.findDijkstra(request);

        assertEquals(PathResult.STATUS_SUCCESS, response.pathResult().getStatus());
        verify(dijkstraPathfinder).findShortestPath(graph, 1L, 2L);
    }

    @Test
    @DisplayName("Issue #28: Operates normally when NetworkService is not present (optional dependency)")
    void findDijkstra_noNetworkServiceInjected_shouldExecuteDirectly() {
        mockNodeExists(1L, 2L);

        Graph graph = createMockGraph();
        when(graphBuilder.build(anyList(), anyList())).thenReturn(graph);

        PathResult expectedPath = PathResult.success(List.of(1L, 2L), 5.2, 8.0, 2, 100_000L);
        when(dijkstraPathfinder.findShortestPath(graph, 1L, 2L)).thenReturn(expectedPath);

        RouteRequest request = new RouteRequest(1L, 2L);
        RouteResponse response = routeServiceWithoutNetwork.findDijkstra(request);

        assertEquals(PathResult.STATUS_SUCCESS, response.pathResult().getStatus());
        verify(dijkstraPathfinder).findShortestPath(graph, 1L, 2L);
    }

    @Test
    @DisplayName("Issue #28: Compare mode correctly reflects pre-check disconnected result")
    void compare_disconnectedNodes_shouldReturnConsistentComparison() {
        mockNodeExists(1L, 3L);
        when(networkService.isReachablePreCheck(1L, 3L)).thenReturn(false);
        when(graphBuilder.build(anyList(), anyList())).thenReturn(createMockGraph());

        RouteRequest request = new RouteRequest(1L, 3L);
        RouteCompareResponse comparison = routeServiceWithNetwork.compare(request);

        assertNotNull(comparison);
        assertEquals(PathResult.STATUS_NO_PATH, comparison.dijkstra().pathResult().getStatus());
        assertEquals(PathResult.STATUS_NO_PATH, comparison.astar().pathResult().getStatus());
        assertTrue(comparison.samePath());
        assertEquals(0, comparison.nodesExploredDelta());
    }

    @Test
    @DisplayName("Validation: Non-existent source node throws 404 ResponseStatusException")
    void runPathfinder_nonExistentSource_shouldThrowNotFound() {
        when(nodeRepository.existsById(999L)).thenReturn(false);

        RouteRequest request = new RouteRequest(999L, 2L);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> routeServiceWithNetwork.findDijkstra(request));

        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Validation: Non-existent target node throws 404 ResponseStatusException")
    void runPathfinder_nonExistentTarget_shouldThrowNotFound() {
        when(nodeRepository.existsById(1L)).thenReturn(true);
        when(nodeRepository.existsById(888L)).thenReturn(false);

        RouteRequest request = new RouteRequest(1L, 888L);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> routeServiceWithNetwork.findDijkstra(request));

        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Listing: listNodes maps repository entities correctly")
    void listNodes_shouldReturnMappedNodeResponses() {
        NodeEntity n1 = new NodeEntity(1L, "HQ", 6.9271, 79.8612, NodeType.HQ);
        NodeEntity n2 = new NodeEntity(2L, "Camp A", 6.9300, 79.8700, NodeType.RESCUE_CAMP);
        when(nodeRepository.findAll()).thenReturn(List.of(n1, n2));

        List<NodeResponse> nodes = routeServiceWithNetwork.listNodes();
        assertEquals(2, nodes.size());
        assertEquals("HQ", nodes.get(0).name());
        assertEquals(NodeType.HQ, nodes.get(0).nodeType());
    }

    @Test
    @DisplayName("Listing: listNeighbors returns adjacent nodes with distance and blocked state")
    void listNeighbors_shouldReturnConnectedNeighbors() {
        when(nodeRepository.existsById(1L)).thenReturn(true);

        EdgeEntity edge = new EdgeEntity();
        edge.setSourceId(1L);
        edge.setTargetId(2L);
        edge.setDistanceKm(10.5);
        edge.setTravelTimeMins(15.0);
        edge.setBlocked(false);

        when(edgeRepository.findAll()).thenReturn(List.of(edge));
        NodeEntity neighbor = new NodeEntity(2L, "Camp A", 6.9300, 79.8700, NodeType.RESCUE_CAMP);
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(neighbor));

        List<NeighborResponse> neighbors = routeServiceWithNetwork.listNeighbors(1L);
        assertEquals(1, neighbors.size());
        assertEquals(2L, neighbors.get(0).nodeId());
        assertEquals("Camp A", neighbors.get(0).name());
        assertEquals(10.5, neighbors.get(0).distanceKm(), 1e-9);
    }
}
