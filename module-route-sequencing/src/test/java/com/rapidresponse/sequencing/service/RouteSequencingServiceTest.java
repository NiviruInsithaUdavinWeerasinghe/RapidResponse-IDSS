package com.rapidresponse.sequencing.service;

import com.rapidresponse.sequencing.dto.ComparisonResponse;
import com.rapidresponse.sequencing.dto.SequencingRequest;
import com.rapidresponse.sequencing.dto.SequencingResponse;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class RouteSequencingServiceTest {

    private NodeRepository nodeRepository;
    private EdgeRepository edgeRepository;
    private DistanceMatrixBuilder distanceMatrixBuilder;
    private RouteSequencingService service;

    @BeforeEach
    void setUp() {
        nodeRepository = Mockito.mock(NodeRepository.class);
        edgeRepository = Mockito.mock(EdgeRepository.class);
        distanceMatrixBuilder = Mockito.mock(DistanceMatrixBuilder.class);
        service = new RouteSequencingService(distanceMatrixBuilder, nodeRepository, edgeRepository);

        // Setup mock database nodes: 0 (depot), 1, 2 (rescue camps)
        List<NodeEntity> nodes = Arrays.asList(
                new NodeEntity(0L, "Depot", 0.0, 0.0, NodeType.HQ),
                new NodeEntity(1L, "Camp A", 1.0, 1.0, NodeType.RESCUE_CAMP),
                new NodeEntity(2L, "Camp B", 2.0, 2.0, NodeType.RESCUE_CAMP)
        );
        when(nodeRepository.findAll()).thenReturn(nodes);

        // Setup mock database edges
        EdgeEntity e1 = new EdgeEntity(0L, 1L, 1.0, 10.0, false, false);
        e1.setId(100L);
        EdgeEntity e2 = new EdgeEntity(1L, 2L, 1.5, 15.0, false, false);
        e2.setId(101L);
        EdgeEntity e3 = new EdgeEntity(2L, 0L, 2.0, 20.0, false, false);
        e3.setId(102L);
        List<EdgeEntity> edges = Arrays.asList(e1, e2, e3);
        when(edgeRepository.findAll()).thenReturn(edges);
    }

    @Test
    void testCalculateExactTour_Success() {
        // Setup distance matrix for stops 0, 1, 2
        double[][] matrix = {
            {0.0, 1.0, 2.0},
            {1.0, 0.0, 1.5},
            {2.0, 1.5, 0.0}
        };
        when(distanceMatrixBuilder.buildMatrix(any(), any())).thenReturn(matrix);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));
        SequencingResponse response = service.calculateExactTour(request);

        assertNotNull(response);
        assertEquals(3.0, response.tourNodeIds().size() - 1);
        assertEquals(0L, response.tourNodeIds().get(0));
        assertEquals(0L, response.tourNodeIds().get(response.tourNodeIds().size() - 1));
        assertEquals(4.5, response.totalDistance(), 1e-9);
    }

    @Test
    void testCalculateHeuristicTour_Success() {
        double[][] matrix = {
            {0.0, 1.0, 2.0},
            {1.0, 0.0, 1.5},
            {2.0, 1.5, 0.0}
        };
        when(distanceMatrixBuilder.buildMatrix(any(), any())).thenReturn(matrix);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));
        SequencingResponse response = service.calculateHeuristicTour(request);

        assertNotNull(response);
        assertEquals(3, response.problemSize());
        assertEquals(4.5, response.totalDistance(), 1e-9);
    }

    @Test
    void testCompareSolvers_Success() {
        double[][] matrix = {
            {0.0, 1.0, 2.0},
            {1.0, 0.0, 1.5},
            {2.0, 1.5, 0.0}
        };
        when(distanceMatrixBuilder.buildMatrix(any(), any())).thenReturn(matrix);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));
        ComparisonResponse response = service.compareSolvers(request);

        assertNotNull(response);
        assertNotNull(response.exact());
        assertNotNull(response.heuristic());
        assertEquals("0.00%", response.optimalityGap());
    }

    @Test
    void testValidation_NodeNotFound() {
        SequencingRequest request = new SequencingRequest(99L, Arrays.asList(1L, 2L));
        assertThrows(IllegalArgumentException.class, () -> service.calculateExactTour(request));
    }

    @Test
    void testValidation_InvalidStopsSize() {
        SequencingRequest request = new SequencingRequest(0L, List.of(1L)); // Needs at least 2 stops
        assertThrows(IllegalArgumentException.class, () -> service.calculateExactTour(request));
    }

    @Test
    void testUnreachableStops_ThrowsIllegalArgumentException() {
        double[][] matrix = {
            {0.0, Double.MAX_VALUE / 2, 2.0},
            {Double.MAX_VALUE / 2, 0.0, 1.5},
            {2.0, 1.5, 0.0}
        };
        when(distanceMatrixBuilder.buildMatrix(any(), any())).thenReturn(matrix);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));
        assertThrows(IllegalArgumentException.class, () -> service.calculateExactTour(request));
    }
}
