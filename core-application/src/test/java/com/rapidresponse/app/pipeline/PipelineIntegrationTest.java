package com.rapidresponse.app.pipeline;

import com.rapidresponse.app.dto.request.DecideAndPackRequest;
import com.rapidresponse.app.dto.request.DecideAndSequenceRequest;
import com.rapidresponse.app.dto.response.DecideAndPackResponse;
import com.rapidresponse.app.dto.response.DecideAndSequenceResponse;
import com.rapidresponse.app.service.DecideAndPackPipeline;
import com.rapidresponse.app.service.DecideAndSequencePipeline;
import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.service.DecisionService;
import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;
import com.rapidresponse.resource.dto.response.ReliefItemResponse;
import com.rapidresponse.resource.service.ResourceService;
import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.sequencing.service.DistanceMatrixBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PipelineIntegrationTest {

    private DecisionService decisionService;
    private ResourceService resourceService;
    private DistanceMatrixBuilder distanceMatrixBuilder;
    private DecideAndPackPipeline decideAndPackPipeline;
    private DecideAndSequencePipeline decideAndSequencePipeline;

    @BeforeEach
    void setUp() {
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
                                new ReliefItemResponse(2L, "Emergency Rations Pack", 50.0, 80.0, com.rapidresponse.resource.entity.ReliefCategory.FOOD)
                        ),
                        175.0,
                        75.0,
                        1000.0,
                        120000L
                );
            }
        };

        // Real DistanceMatrixBuilder with real DijkstraPathfinder
        DijkstraPathfinder dijkstra = new DijkstraPathfinder();
        distanceMatrixBuilder = new DistanceMatrixBuilder(dijkstra);

        // Instantiate pipelines
        decideAndPackPipeline = new DecideAndPackPipeline(decisionService, resourceService);
        decideAndSequencePipeline = new DecideAndSequencePipeline(decisionService, distanceMatrixBuilder);
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
    @DisplayName("Issue #29: Test Module 4 -> Module 2 (Decide & Pack) Pipeline")
    void testDecideAndPackPipeline() {
        // Given
        List<CreateSOSRequest> requests = createSampleSOSRequests();
        DecideAndPackRequest pipelineReq = new DecideAndPackRequest(
                5.0, // 5 rescue trucks max
                0.5, 0.3, 0.2,
                1L,
                List.of(1L, 2L, 3L),
                requests,
                "EXACT",
                "EXACT"
        );

        // When
        DecideAndPackResponse response = decideAndPackPipeline.execute(pipelineReq);

        // Then
        assertNotNull(response);
        assertNotNull(response.decisionResult());
        assertNotNull(response.allocationResult());

        // Decision assertions
        assertTrue(response.totalApprovedCamps() > 0);
        assertTrue(response.totalRescueTrucksUsed() <= 5.0);
        assertTrue(response.decisionResult().getTotalScore() > 0);

        // Allocation assertions
        assertEquals(75.0, response.helicopterPayloadUsedKg());
        assertEquals(1000.0, response.helicopterPayloadCapacityKg());
        assertEquals(2, response.allocationResult().selectedItems().size());

        // Summary assertions
        assertNotNull(response.summary());
        assertTrue(response.summary().contains("Module 4 selected"));
        assertTrue(response.summary().contains("Module 2 packed"));
    }

    @Test
    @DisplayName("Issue #30: Test Module 4 -> Module 5 (Decide & Sequence) Pipeline")
    void testDecideAndSequencePipeline() {
        // Given
        List<CreateSOSRequest> requests = createSampleSOSRequests();
        DecideAndSequenceRequest pipelineReq = new DecideAndSequenceRequest(
                5.0,
                0.5, 0.3, 0.2,
                1L, // HQ Depot
                requests,
                "EXACT",
                "AUTO"
        );

        // When
        DecideAndSequenceResponse response = decideAndSequencePipeline.execute(pipelineReq);

        // Then
        assertNotNull(response);
        assertNotNull(response.decisionResult());
        assertNotNull(response.tourSequence());

        // Tour sequence assertions
        assertFalse(response.tourSequence().isEmpty());
        // First and last stop should be HQ
        assertEquals(1L, response.tourSequence().get(0).nodeId());
        assertEquals(1L, response.tourSequence().get(response.tourSequence().size() - 1).nodeId());

        assertTrue(response.totalTourDistanceKm() > 0.0);
        assertEquals("Held-Karp (Exact Dynamic Programming)", response.sequencingAlgorithmUsed());
        assertNotNull(response.summary());
        assertTrue(response.summary().contains("Decide & Sequence pipeline completed"));
    }
}
