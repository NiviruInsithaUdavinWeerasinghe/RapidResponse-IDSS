package com.rapidresponse.sequencing.service;

import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class DistanceMatrixBuilderTest {

    private DijkstraPathfinder pathfinder;
    private DistanceMatrixBuilder builder;
    private Graph graph;

    @BeforeEach
    public void setUp() {
        pathfinder = Mockito.mock(DijkstraPathfinder.class);
        builder = new DistanceMatrixBuilder(pathfinder);
        
        graph = new Graph();
        graph.addNode(new Node(1L, "HQ", 0.0, 0.0, NodeType.HQ));
        graph.addNode(new Node(2L, "Camp A", 0.1, 0.1, NodeType.RESCUE_CAMP));
        graph.addNode(new Node(3L, "Camp B", 0.2, 0.2, NodeType.RESCUE_CAMP));
    }

    @Test
    public void testNullGraphThrowsException() {
        assertThrows(NullPointerException.class, () -> {
            builder.buildMatrix(null, Arrays.asList(1L, 2L));
        });
    }

    @Test
    public void testNullNodeListThrowsException() {
        assertThrows(NullPointerException.class, () -> {
            builder.buildMatrix(graph, null);
        });
    }

    @Test
    public void testEmptyNodeListThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            builder.buildMatrix(graph, Collections.emptyList());
        });
    }

    @Test
    public void testNullNodeInListThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            builder.buildMatrix(graph, Arrays.asList(1L, null, 2L));
        });
    }

    @Test
    public void testNonExistentNodeThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            builder.buildMatrix(graph, Arrays.asList(1L, 999L));
        });
    }

    @Test
    public void testSuccessfulMatrixBuildingAndCaching() {
        // Mock pathfinder response from 1 -> 2 (dist 3.5)
        when(pathfinder.findShortestPath(eq(graph), eq(1L), eq(2L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(1L, 2L)).totalDistanceKm(3.5).totalTravelTimeMins(5.0).build());
        
        // Mock pathfinder response from 2 -> 1 (dist 3.5)
        when(pathfinder.findShortestPath(eq(graph), eq(2L), eq(1L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(2L, 1L)).totalDistanceKm(3.5).totalTravelTimeMins(5.0).build());

        // Mock pathfinder response from 1 -> 3 (dist 10.0)
        when(pathfinder.findShortestPath(eq(graph), eq(1L), eq(3L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(1L, 3L)).totalDistanceKm(10.0).totalTravelTimeMins(12.0).build());

        // Mock pathfinder response from 3 -> 1 (dist 10.0)
        when(pathfinder.findShortestPath(eq(graph), eq(3L), eq(1L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(3L, 1L)).totalDistanceKm(10.0).totalTravelTimeMins(12.0).build());

        // Mock pathfinder response from 2 -> 3 (dist 6.5)
        when(pathfinder.findShortestPath(eq(graph), eq(2L), eq(3L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(2L, 3L)).totalDistanceKm(6.5).totalTravelTimeMins(8.0).build());

        // Mock pathfinder response from 3 -> 2 (dist 6.5)
        when(pathfinder.findShortestPath(eq(graph), eq(3L), eq(2L)))
                .thenReturn(PathResult.builder().nodeSequence(Arrays.asList(3L, 2L)).totalDistanceKm(6.5).totalTravelTimeMins(8.0).build());

        List<Long> stopNodeIds = Arrays.asList(1L, 2L, 3L);
        double[][] matrix = builder.buildMatrix(graph, stopNodeIds);

        assertNotNull(matrix);
        assertEquals(3, matrix.length);
        assertEquals(3, matrix[0].length);

        // Self loops must be 0
        assertEquals(0.0, matrix[0][0], 1e-6);
        assertEquals(0.0, matrix[1][1], 1e-6);
        assertEquals(0.0, matrix[2][2], 1e-6);

        // Cross values
        assertEquals(3.5, matrix[0][1], 1e-6);
        assertEquals(3.5, matrix[1][0], 1e-6);
        assertEquals(10.0, matrix[0][2], 1e-6);
        assertEquals(10.0, matrix[2][0], 1e-6);
        assertEquals(6.5, matrix[1][2], 1e-6);
        assertEquals(6.5, matrix[2][1], 1e-6);

        // Check path Cache entries
        Map<String, PathResult> cache = builder.getCachedPaths();
        assertEquals(6, cache.size());
        assertTrue(cache.containsKey("1-2"));
        assertTrue(cache.containsKey("2-3"));
        assertEquals(3.5, cache.get("1-2").getTotalDistanceKm());
    }

    @Test
    public void testDisconnectedNodeTargetUnreachable() {
        // 1 to 2 is disconnected (returns null sequence or empty PathResult)
        when(pathfinder.findShortestPath(eq(graph), eq(1L), eq(2L)))
                .thenReturn(PathResult.builder().nodeSequence(Collections.emptyList()).totalDistanceKm(Double.MAX_VALUE / 2).build());

        List<Long> stopNodeIds = Arrays.asList(1L, 2L);
        double[][] matrix = builder.buildMatrix(graph, stopNodeIds);

        assertEquals(0.0, matrix[0][0]);
        assertEquals(Double.MAX_VALUE / 2, matrix[0][1]);
        
        // Disconnected path should not populate cache
        Map<String, PathResult> cache = builder.getCachedPaths();
        assertFalse(cache.containsKey("1-2"));
    }
}
