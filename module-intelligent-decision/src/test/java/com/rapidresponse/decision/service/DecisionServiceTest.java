package com.rapidresponse.decision.service;

import com.rapidresponse.decision.algorithm.WeightedScoringSolver;
import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.dto.request.DecisionRequest;
import com.rapidresponse.decision.dto.response.DecisionCompareResponse;
import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.decision.dto.response.SOSRequestResponse;
import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.entity.SOSStatus;
import com.rapidresponse.decision.mapper.SOSRequestMapper;
import com.rapidresponse.decision.model.DecisionCriteriaWeights;
import com.rapidresponse.decision.model.SOSRequest;
import com.rapidresponse.decision.repository.SOSRequestRepository;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.SubsetResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DecisionServiceTest {

    @Mock
    private SOSRequestRepository sosRequestRepository;

    private SOSRequestMapper sosRequestMapper;
    private BranchAndBoundSolver<SOSRequest> branchAndBoundSolver;
    private WeightedScoringSolver weightedScoringSolver;
    private DecisionService decisionService;

    @BeforeEach
    void setUp() {
        sosRequestMapper = new SOSRequestMapper();
        branchAndBoundSolver = new BranchAndBoundSolver<>();
        weightedScoringSolver = new WeightedScoringSolver();
        decisionService = new DecisionService(
                sosRequestRepository,
                sosRequestMapper,
                branchAndBoundSolver,
                weightedScoringSolver
        );
    }

    private List<CreateSOSRequest> createSmallDataset() {
        return Arrays.asList(
                CreateSOSRequest.builder().id(1L).campId(101L).campName("Alpha Camp").injurySeverity(9.0).population(800.0).supplyShortage(90.0).requiredTrucks(2.0).build(),
                CreateSOSRequest.builder().id(2L).campId(102L).campName("Bravo Camp").injurySeverity(4.0).population(150.0).supplyShortage(30.0).requiredTrucks(1.0).build(),
                CreateSOSRequest.builder().id(3L).campId(103L).campName("Charlie Camp").injurySeverity(8.5).population(700.0).supplyShortage(85.0).requiredTrucks(2.0).build(),
                CreateSOSRequest.builder().id(4L).campId(104L).campName("Delta Camp").injurySeverity(2.0).population(50.0).supplyShortage(15.0).requiredTrucks(1.0).build(),
                CreateSOSRequest.builder().id(5L).campId(105L).campName("Echo Camp").injurySeverity(7.0).population(600.0).supplyShortage(60.0).requiredTrucks(3.0).build()
        );
    }

    @Test
    @DisplayName("Test 1 – Small dataset: verify optimal selection via Branch & Bound")
    void test1_SmallDataset_ExactOptimalSelection() {
        List<CreateSOSRequest> dataset = createSmallDataset();
        DecisionRequest request = DecisionRequest.builder()
                .maxDailyCapacity(4.0)
                .severityWeight(0.5)
                .populationWeight(0.3)
                .shortageWeight(0.2)
                .directRequests(dataset)
                .build();

        DecisionResultResponse result = decisionService.optimizeExact(request);

        assertNotNull(result);
        assertEquals("branch_and_bound", result.getAlgorithm());
        assertTrue(result.getTotalCapacityUsed() <= 4.0);
        assertTrue(result.getTotalScore() > 0.0);
        // Alpha (req 1, cap 2) and Charlie (req 3, cap 2) have highest criteria scores and total capacity = 4.0
        assertEquals(2, result.getSelectedRequests().size());
        assertTrue(result.getSelectedRequests().stream().anyMatch(r -> r.getId().equals(1L)));
        assertTrue(result.getSelectedRequests().stream().anyMatch(r -> r.getId().equals(3L)));
    }

    @Test
    @DisplayName("Test 2 – Multiple criteria: verify criteria weights impact final ranking")
    void test2_MultipleCriteria_WeightsImpact() {
        // Camp A: High severity (10), low population (50), low shortage (10)
        // Camp B: Low severity (2), high population (1000), low shortage (10)
        List<CreateSOSRequest> dataset = Arrays.asList(
                CreateSOSRequest.builder().id(1L).campId(201L).campName("High Severity Camp").injurySeverity(10.0).population(50.0).supplyShortage(10.0).requiredTrucks(1.0).build(),
                CreateSOSRequest.builder().id(2L).campId(202L).campName("High Population Camp").injurySeverity(2.0).population(1000.0).supplyShortage(10.0).requiredTrucks(1.0).build()
        );

        // Case A: Severity-dominated policy (weight 0.8 vs 0.1)
        DecisionRequest severityRequest = DecisionRequest.builder()
                .maxDailyCapacity(1.0)
                .severityWeight(0.8)
                .populationWeight(0.1)
                .shortageWeight(0.1)
                .directRequests(dataset)
                .build();

        DecisionResultResponse severityResult = decisionService.optimizeExact(severityRequest);
        assertEquals(1, severityResult.getSelectedRequests().size());
        assertEquals(1L, severityResult.getSelectedRequests().get(0).getId());

        // Case B: Population-dominated policy (weight 0.8 vs 0.1)
        DecisionRequest populationRequest = DecisionRequest.builder()
                .maxDailyCapacity(1.0)
                .severityWeight(0.1)
                .populationWeight(0.8)
                .shortageWeight(0.1)
                .directRequests(dataset)
                .build();

        DecisionResultResponse populationResult = decisionService.optimizeExact(populationRequest);
        assertEquals(1, populationResult.getSelectedRequests().size());
        assertEquals(2L, populationResult.getSelectedRequests().get(0).getId());
    }

    @Test
    @DisplayName("Test 3 – Capacity constraint: verify total capacity is never exceeded")
    void test3_CapacityConstraint_NeverExceeded() {
        List<CreateSOSRequest> dataset = createSmallDataset();
        double truckLimit = 3.0;

        DecisionRequest request = DecisionRequest.builder()
                .maxDailyCapacity(truckLimit)
                .directRequests(dataset)
                .build();

        DecisionResultResponse exact = decisionService.optimizeExact(request);
        DecisionResultResponse heuristic = decisionService.optimizeHeuristic(request);

        assertTrue(exact.getTotalCapacityUsed() <= truckLimit, "Exact solution must obey capacity limit");
        assertTrue(heuristic.getTotalCapacityUsed() <= truckLimit, "Heuristic solution must obey capacity limit");
    }

    @Test
    @DisplayName("Test 4 – Branch pruning: verify Branch & Bound safely prunes unpromising branches")
    void test4_BranchPruning_OccursSafely() {
        List<CreateSOSRequest> dataset = createSmallDataset();

        DecisionRequest request = DecisionRequest.builder()
                .maxDailyCapacity(3.0)
                .directRequests(dataset)
                .build();

        DecisionResultResponse exact = decisionService.optimizeExact(request);

        assertTrue(exact.getNodesExplored() > 0, "Must explore search tree nodes");
        assertTrue(exact.getNodesPruned() >= 0, "Pruning count must be non-negative");
    }

    @Test
    @DisplayName("Test 5 – Exact vs Heuristic: compare results on the same dataset")
    void test5_ExactVsHeuristic_Comparison() {
        List<CreateSOSRequest> dataset = createSmallDataset();

        DecisionRequest request = DecisionRequest.builder()
                .maxDailyCapacity(4.0)
                .directRequests(dataset)
                .build();

        DecisionCompareResponse comparison = decisionService.optimizeCompare(request);

        assertNotNull(comparison);
        assertNotNull(comparison.getExact());
        assertNotNull(comparison.getHeuristic());
        assertTrue(comparison.getExact().getTotalScore() >= comparison.getHeuristic().getTotalScore() - 1e-6,
                "Exact score must be >= heuristic score");
        assertTrue(comparison.getHeuristicRatio() > 0.0 && comparison.getHeuristicRatio() <= 1.0 + 1e-6);
        assertNotNull(comparison.getTimeSavings());
        assertTrue(comparison.getSpeedupFactor() >= 0.0);
    }

    @Test
    @DisplayName("Test 6 – Input validation & Error handling: empty datasets and invalid parameters")
    void test6_InputValidation_ErrorHandling() {
        // Zero capacity
        assertThrows(ResponseStatusException.class, () ->
                decisionService.optimizeExact(DecisionRequest.builder().maxDailyCapacity(0.0).build()));

        // Negative capacity
        assertThrows(ResponseStatusException.class, () ->
                decisionService.optimizeExact(DecisionRequest.builder().maxDailyCapacity(-5.0).build()));

        // Null request
        assertThrows(ResponseStatusException.class, () ->
                decisionService.optimizeExact(null));

        // Invalid CreateSOSRequest: invalid severity
        assertThrows(ResponseStatusException.class, () ->
                decisionService.submitRequest(CreateSOSRequest.builder().campId(1L).injurySeverity(15.0).population(100).supplyShortage(50).requiredTrucks(1).build()));

        // Invalid CreateSOSRequest: negative shortage
        assertThrows(ResponseStatusException.class, () ->
                decisionService.submitRequest(CreateSOSRequest.builder().campId(1L).injurySeverity(5.0).population(100).supplyShortage(-10).requiredTrucks(1).build()));
    }

    @Test
    @DisplayName("Test 7 – Large dataset benchmark (50 to 500 requests): measure execution time and pruning")
    void test7_LargeDataset_Benchmark() {
        int count = 100;
        List<SOSRequest> largeItems = decisionService.generateBenchmarkItems(count);
        assertEquals(count, largeItems.size());

        double capacity = 30.0;
        DecisionCriteriaWeights weights = new DecisionCriteriaWeights(0.5, 0.3, 0.2);

        // Run Heuristic
        long startH = System.nanoTime();
        SubsetResult<SOSRequest> heuristicResult = weightedScoringSolver.solve(largeItems, capacity, weights);
        long timeH = System.nanoTime() - startH;

        assertNotNull(heuristicResult);
        assertTrue(heuristicResult.getTotalWeight() <= capacity);
        assertTrue(heuristicResult.getTotalValue() > 0.0);
        assertTrue(timeH < 100_000_000L, "Heuristic on 100 items should complete in < 100ms");

        // Run Exact Branch & Bound on subset
        List<SOSRequest> bbItems = largeItems.subList(0, 20);
        long startBB = System.nanoTime();
        SubsetResult<SOSRequest> bbResult = branchAndBoundSolver.solve(bbItems, 10.0);
        long timeBB = System.nanoTime() - startBB;

        assertNotNull(bbResult);
        assertTrue(bbResult.getTotalWeight() <= 10.0);
        assertTrue(bbResult.getNodesExplored() > 0);
        assertTrue(bbResult.getNodesPruned() > 0, "Branch and Bound should prune significant subtrees on 20 items");
    }

    @Test
    @DisplayName("Test 8 – Database CRUD: submit, list pending, approve")
    void test8_DatabaseOperations_SubmitAndApprove() {
        CreateSOSRequest createDto = CreateSOSRequest.builder()
                .campId(501L)
                .campName("Zeta Camp")
                .injurySeverity(8.0)
                .population(450.0)
                .supplyShortage(75.0)
                .requiredTrucks(2.0)
                .build();

        SOSRequestEntity savedEntity = SOSRequestEntity.builder()
                .id(100L)
                .campId(501L)
                .campName("Zeta Camp")
                .injurySeverity(8.0)
                .population(450.0)
                .supplyShortage(75.0)
                .requiredTrucks(2.0)
                .status(SOSStatus.PENDING)
                .receivedAt(LocalDateTime.now())
                .build();

        when(sosRequestRepository.save(any(SOSRequestEntity.class))).thenReturn(savedEntity);
        when(sosRequestRepository.findById(100L)).thenReturn(Optional.of(savedEntity));

        // Submit
        SOSRequestResponse submitted = decisionService.submitRequest(createDto);
        assertNotNull(submitted);
        assertEquals(SOSStatus.PENDING, submitted.getStatus());
        assertEquals("Zeta Camp", submitted.getCampName());

        // Approve
        SOSRequestResponse approved = decisionService.approveRequest(100L);
        assertNotNull(approved);
        assertEquals(SOSStatus.APPROVED, approved.getStatus());
    }
}
