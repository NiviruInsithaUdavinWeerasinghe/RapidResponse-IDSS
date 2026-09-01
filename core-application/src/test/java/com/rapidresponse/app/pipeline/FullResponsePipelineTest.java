package com.rapidresponse.app.pipeline;

import com.rapidresponse.app.controller.PipelineController;
import com.rapidresponse.app.dto.request.FullResponsePipelineRequest;
import com.rapidresponse.app.dto.response.FullResponsePipelineResponse;
import com.rapidresponse.app.service.DecideAndPackPipeline;
import com.rapidresponse.app.service.DecideAndSequencePipeline;
import com.rapidresponse.app.service.FullResponsePipeline;
import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.service.DecisionService;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.network.service.NetworkService;
import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;
import com.rapidresponse.resource.dto.response.ReliefItemResponse;
import com.rapidresponse.resource.service.ResourceService;
import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.route.service.RouteService;
import com.rapidresponse.sequencing.service.DistanceMatrixBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FullResponsePipelineTest {

    private NetworkService networkService;
    private RouteService routeService;
    private DecisionService decisionService;
    private ResourceService resourceService;
    private DistanceMatrixBuilder distanceMatrixBuilder;
    private FullResponsePipeline fullResponsePipeline;
    private PipelineController pipelineController;

    @BeforeEach
    void setUp() {
        // Mock / Stub NetworkService
        networkService = new NetworkService(null, null) {
            @Override
            public ReachabilityResponse analyseReachability() {
                return ReachabilityResponse.builder()
                        .reachableCamps(List.of(
                                ReachabilityResponse.NodeInfo.builder().id(1L).name("HQ Depot").nodeType("HQ").hopDistance(0).build(),
                                ReachabilityResponse.NodeInfo.builder().id(101L).name("Alpha Sector Camp").nodeType("RESCUE_CAMP").hopDistance(1).build(),
                                ReachabilityResponse.NodeInfo.builder().id(102L).name("Bravo Valley Shelter").nodeType("RESCUE_CAMP").hopDistance(1).build(),
                                ReachabilityResponse.NodeInfo.builder().id(103L).name("Charlie Hill Station").nodeType("RESCUE_CAMP").hopDistance(2).build()
                        ))
                        .isolatedCamps(List.of(
                                ReachabilityResponse.NodeInfo.builder().id(999L).name("Disconnected Ghost Camp").nodeType("RESCUE_CAMP").hopDistance(-1).build()
                        ))
                        .totalReachable(4)
                        .executionTimeNanos(50000L)
                        .build();
            }

            @Override
            public MstResponse computeMst() {
                return MstResponse.builder()
                        .totalCost(42.5)
                        .roadsToClear(List.of())
                        .componentsReduced("4 -> 1")
                        .build();
            }

            @Override
            public Boolean isReachablePreCheck(Long sourceId, Long targetId) {
                if (targetId.equals(999L)) {
                    return false;
                }
                return true;
            }
        };

        // Real DecisionService instance with real B&B and WeightedScoring solvers
        com.rapidresponse.decision.algorithm.WeightedScoringSolver weightedSolver =
                new com.rapidresponse.decision.algorithm.WeightedScoringSolver();
        com.rapidresponse.shared.algorithm.BranchAndBoundSolver<com.rapidresponse.decision.model.SOSRequest> bbSolver =
                new com.rapidresponse.shared.algorithm.BranchAndBoundSolver<>();
        com.rapidresponse.decision.mapper.SOSRequestMapper mapper =
                new com.rapidresponse.decision.mapper.SOSRequestMapper();
        decisionService = new DecisionService(null, mapper, bbSolver, weightedSolver);

        // Stub ResourceService returning valid packing allocation
        resourceService = new ResourceService(null, null, null, null, null) {
            @Override
            public AllocationResultResponse allocateExact(AllocationRequest request) {
                return new AllocationResultResponse(
                        "branch_and_bound",
                        List.of(
                                new ReliefItemResponse(1L, "Trauma Medical Kit", 25.0, 95.0, com.rapidresponse.resource.entity.ReliefCategory.MEDICAL),
                                new ReliefItemResponse(2L, "Emergency Food Rations", 50.0, 80.0, com.rapidresponse.resource.entity.ReliefCategory.FOOD),
                                new ReliefItemResponse(3L, "Water Purification Units", 40.0, 88.0, com.rapidresponse.resource.entity.ReliefCategory.WATER)
                        ),
                        263.0,
                        115.0,
                        1000.0,
                        85000L
                );
            }

            @Override
            public AllocationResultResponse allocateHeuristic(AllocationRequest request) {
                return new AllocationResultResponse(
                        "greedy",
                        List.of(
                                new ReliefItemResponse(1L, "Trauma Medical Kit", 25.0, 95.0, com.rapidresponse.resource.entity.ReliefCategory.MEDICAL),
                                new ReliefItemResponse(2L, "Emergency Food Rations", 50.0, 80.0, com.rapidresponse.resource.entity.ReliefCategory.FOOD)
                        ),
                        175.0,
                        75.0,
                        1000.0,
                        45000L
                );
            }
        };

        // Real DistanceMatrixBuilder with real DijkstraPathfinder
        DijkstraPathfinder dijkstra = new DijkstraPathfinder();
        distanceMatrixBuilder = new DistanceMatrixBuilder(dijkstra);
        com.rapidresponse.app.service.FullResponsePipelineValidator validator =
                new com.rapidresponse.app.service.FullResponsePipelineValidator();

        // FullResponsePipeline
        fullResponsePipeline = new FullResponsePipeline(
                networkService,
                routeService,
                decisionService,
                resourceService,
                distanceMatrixBuilder,
                validator
        );

        DecideAndPackPipeline decideAndPackPipeline = new DecideAndPackPipeline(decisionService, resourceService);
        DecideAndSequencePipeline decideAndSequencePipeline = new DecideAndSequencePipeline(decisionService, distanceMatrixBuilder);
        pipelineController = new PipelineController(decideAndPackPipeline, decideAndSequencePipeline, fullResponsePipeline);
    }

    private List<CreateSOSRequest> createSampleSOSRequests() {
        return List.of(
                new CreateSOSRequest(1L, 101L, "Alpha Sector Camp", 9.0, 800, 90.0, 3.0),
                new CreateSOSRequest(2L, 102L, "Bravo Valley Shelter", 4.0, 300, 40.0, 1.0),
                new CreateSOSRequest(3L, 103L, "Charlie Hill Station", 8.5, 750, 85.0, 2.0),
                new CreateSOSRequest(4L, 104L, "Delta River Outpost", 3.0, 150, 20.0, 1.0),
                new CreateSOSRequest(5L, 105L, "Echo Ridge Haven", 7.5, 600, 75.0, 2.0)
        );
    }

    @Test
    @DisplayName("Issue #31: Test Full End-to-End Master Pipeline (Exact Mode)")
    void testFullResponsePipelineExecution_ExactMode() {
        // Given
        List<CreateSOSRequest> requests = createSampleSOSRequests();
        FullResponsePipelineRequest request = new FullResponsePipelineRequest(
                1L, // HQ Node ID
                1L, // Helicopter ID
                6.0, // Max trucks daily capacity
                0.5, 0.3, 0.2,
                List.of(1L, 2L, 3L),
                requests,
                "EXACT",
                "EXACT",
                "HELD_KARP"
        );

        // When
        FullResponsePipelineResponse response = fullResponsePipeline.execute(request);

        // Then
        assertNotNull(response);
        assertEquals("SUCCESS", response.status());
        assertNotNull(response.message());

        // Stage 1 (Network Analysis) assertions
        assertNotNull(response.networkReachability());
        assertEquals(4, response.networkReachability().getTotalReachable());
        assertNotNull(response.networkMst());

        // Stage 2 (Route Pre-Check) assertions
        assertNotNull(response.preCheckReachabilityMap());
        assertTrue(response.preCheckReachabilityMap().get(101L));
        assertFalse(response.preCheckReachabilityMap().get(999L));

        // Stage 3 (Decision) assertions
        assertNotNull(response.decisionResult());
        assertTrue(response.decisionResult().getTotalCapacityUsed() <= 6.0);
        assertFalse(response.decisionResult().getSelectedRequests().isEmpty());

        // Stage 4 (Resource Allocation) assertions
        assertNotNull(response.resourceAllocation());
        assertEquals(115.0, response.resourceAllocation().totalWeight());
        assertEquals(3, response.resourceAllocation().selectedItems().size());

        // Stage 5 (Route Sequencing) assertions
        assertNotNull(response.deliveryTourSequence());
        assertFalse(response.deliveryTourSequence().isEmpty());
        // Starts and finishes at HQ (Node 1)
        assertEquals(1L, response.deliveryTourSequence().get(0).nodeId());
        assertEquals(1L, response.deliveryTourSequence().get(response.deliveryTourSequence().size() - 1).nodeId());
        assertTrue(response.totalTourDistanceKm() > 0.0);
        assertEquals("Held-Karp (Exact Dynamic Programming)", response.sequencingAlgorithmUsed());

        // Stage timing assertions
        assertNotNull(response.stageExecutionTimesNanos());
        assertEquals(5, response.stageExecutionTimesNanos().size());
        assertTrue(response.totalPipelineTimeNanos() > 0);
    }

    @Test
    @DisplayName("Issue #31: Test Full Pipeline in Heuristic Mode with 2-Opt TSP")
    void testFullResponsePipelineExecution_HeuristicMode() {
        // Given
        List<CreateSOSRequest> requests = createSampleSOSRequests();
        FullResponsePipelineRequest request = new FullResponsePipelineRequest(
                1L,
                1L,
                5.0,
                0.5, 0.3, 0.2,
                List.of(1L, 2L),
                requests,
                "HEURISTIC",
                "HEURISTIC",
                "TWO_OPT"
        );

        // When
        FullResponsePipelineResponse response = fullResponsePipeline.execute(request);

        // Then
        assertNotNull(response);
        assertEquals("SUCCESS", response.status());
        assertEquals("2-Opt Local Search (Heuristic)", response.sequencingAlgorithmUsed());
        assertEquals("greedy", response.resourceAllocation().algorithm());
    }

    @Test
    @DisplayName("Issue #31: Test Graceful Pipeline Halt on Zero Capacity")
    void testFullResponsePipeline_GracefulHaltOnZeroCapacity() {
        // Given
        List<CreateSOSRequest> requests = createSampleSOSRequests();
        FullResponsePipelineRequest request = new FullResponsePipelineRequest(
                1L,
                1L,
                0.5, // 0.5 capacity is smaller than minimum required (1.0) -> No camps approved
                0.5, 0.3, 0.2,
                null,
                requests,
                "EXACT",
                "EXACT",
                "AUTO"
        );

        // When
        FullResponsePipelineResponse response = fullResponsePipeline.execute(request);

        // Then
        assertNotNull(response);
        assertEquals("PARTIAL_SUCCESS", response.status());
        assertTrue(response.message().contains("No SOS requests were approved"));
        assertNull(response.resourceAllocation());
        assertTrue(response.deliveryTourSequence().isEmpty());
    }

    @Test
    @DisplayName("Issue #31: Test REST Controller Endpoint POST /api/v1/pipeline/full-response")
    void testPipelineController_FullResponseEndpoint() {
        // Given
        FullResponsePipelineRequest request = new FullResponsePipelineRequest(
                1L, 1L, 5.0, 0.5, 0.3, 0.2, null, createSampleSOSRequests(), "EXACT", "EXACT", "AUTO"
        );

        // When
        ResponseEntity<FullResponsePipelineResponse> responseEntity = pipelineController.fullResponse(request);

        // Then
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertNotNull(responseEntity.getBody());
        assertEquals("SUCCESS", responseEntity.getBody().status());
    }
}
