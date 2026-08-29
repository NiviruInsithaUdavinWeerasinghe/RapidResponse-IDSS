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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Core service layer for Module 4: Intelligent Decision Support System.
 * Coordinates data loading, criteria scoring, solver execution (Branch & Bound and Weighted Scoring),
 * and algorithm comparisons for emergency disaster relief operations.
 */
@Service
public class DecisionService {

    private final SOSRequestRepository sosRequestRepository;
    private final SOSRequestMapper sosRequestMapper;
    private final BranchAndBoundSolver<SOSRequest> branchAndBoundSolver;
    private final WeightedScoringSolver weightedScoringSolver;

    public DecisionService(SOSRequestRepository sosRequestRepository,
                           SOSRequestMapper sosRequestMapper,
                           BranchAndBoundSolver<SOSRequest> branchAndBoundSolver,
                           WeightedScoringSolver weightedScoringSolver) {
        this.sosRequestRepository = sosRequestRepository;
        this.sosRequestMapper = sosRequestMapper;
        this.branchAndBoundSolver = branchAndBoundSolver;
        this.weightedScoringSolver = weightedScoringSolver;
    }

    /**
     * Solves the emergency SOS batch selection using the exact Branch & Bound algorithm.
     */
    public DecisionResultResponse optimizeExact(DecisionRequest request) {
        validateDecisionRequest(request);
        List<SOSRequest> items = loadRequests(request);
        DecisionCriteriaWeights weights = extractWeights(request);

        // Normalize and compute MCDA composite scores
        List<SOSRequest> scoredItems = weightedScoringSolver.normalizeAndScore(items, weights);

        SubsetResult<SOSRequest> result = branchAndBoundSolver.solve(scoredItems, request.getMaxDailyCapacity());
        return toResultResponse(result, "branch_and_bound", request.getMaxDailyCapacity());
    }

    /**
     * Solves the emergency SOS batch selection using the fast Weighted Scoring heuristic.
     */
    public DecisionResultResponse optimizeHeuristic(DecisionRequest request) {
        validateDecisionRequest(request);
        List<SOSRequest> items = loadRequests(request);
        DecisionCriteriaWeights weights = extractWeights(request);

        SubsetResult<SOSRequest> result = weightedScoringSolver.solve(items, request.getMaxDailyCapacity(), weights);
        return toResultResponse(result, "weighted_scoring", request.getMaxDailyCapacity());
    }

    /**
     * Executes both Branch & Bound and Weighted Scoring on the exact same dataset,
     * providing a comprehensive side-by-side performance comparison.
     */
    public DecisionCompareResponse optimizeCompare(DecisionRequest request) {
        validateDecisionRequest(request);
        List<SOSRequest> items = loadRequests(request);
        DecisionCriteriaWeights weights = extractWeights(request);

        // Normalize once to ensure identical baseline scores for both solvers
        List<SOSRequest> scoredItems = weightedScoringSolver.normalizeAndScore(items, weights);

        // Run Exact Method (Branch & Bound)
        SubsetResult<SOSRequest> exactResult = branchAndBoundSolver.solve(scoredItems, request.getMaxDailyCapacity());
        DecisionResultResponse exactResponse = toResultResponse(exactResult, "branch_and_bound", request.getMaxDailyCapacity());

        // Run Heuristic Method (Weighted Scoring)
        SubsetResult<SOSRequest> heuristicResult = weightedScoringSolver.solve(scoredItems, request.getMaxDailyCapacity(), weights);
        DecisionResultResponse heuristicResponse = toResultResponse(heuristicResult, "weighted_scoring", request.getMaxDailyCapacity());

        // Compute analytical comparison metrics
        double exactScore = exactResponse.getTotalScore();
        double heuristicScore = heuristicResponse.getTotalScore();

        double heuristicRatio = exactScore <= 1e-9 ? 1.0 : (heuristicScore / exactScore);
        double scoreDiff = Math.max(0.0, exactScore - heuristicScore);

        long timeDiffNanos = exactResult.getExecutionTimeNanos() - heuristicResult.getExecutionTimeNanos();
        double timeSavingsMs = Math.max(0.0, timeDiffNanos / 1_000_000.0);
        String formattedTimeSavings = String.format("%.2f ms", timeSavingsMs);

        double speedup = heuristicResult.getExecutionTimeNanos() > 0
                ? (double) exactResult.getExecutionTimeNanos() / heuristicResult.getExecutionTimeNanos()
                : 1.0;

        return DecisionCompareResponse.builder()
                .exact(exactResponse)
                .heuristic(heuristicResponse)
                .heuristicRatio(Math.round(heuristicRatio * 1000.0) / 1000.0)
                .scoreDifference(Math.round(scoreDiff * 100.0) / 100.0)
                .timeSavings(formattedTimeSavings)
                .timeSavingsNanos(timeDiffNanos)
                .speedupFactor(Math.round(speedup * 100.0) / 100.0)
                .nodesPrunedByBranchAndBound(exactResult.getNodesPruned())
                .nodesExploredByBranchAndBound(exactResult.getNodesExplored())
                .build();
    }

    /**
     * Lists all pending SOS requests in the database.
     */
    public List<SOSRequestResponse> listPendingRequests() {
        return sosRequestRepository.findAllByStatusOrderByIdAsc(SOSStatus.PENDING).stream()
                .map(sosRequestMapper::entityToResponse)
                .toList();
    }

    /**
     * Lists all SOS requests in the database regardless of status.
     */
    public List<SOSRequestResponse> listAllRequests() {
        return sosRequestRepository.findAll().stream()
                .map(sosRequestMapper::entityToResponse)
                .toList();
    }

    /**
     * Submits a new SOS rescue request into the system.
     */
    @Transactional
    public SOSRequestResponse submitRequest(CreateSOSRequest request) {
        validateCreateRequest(request);

        SOSRequestEntity entity = sosRequestMapper.toEntity(request);
        entity.setStatus(SOSStatus.PENDING);
        entity.setReceivedAt(LocalDateTime.now());

        SOSRequestEntity saved = sosRequestRepository.save(entity);
        return sosRequestMapper.entityToResponse(saved);
    }

    /**
     * Approves a specific SOS request by its ID.
     */
    @Transactional
    public SOSRequestResponse approveRequest(Long id) {
        SOSRequestEntity entity = sosRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "SOS request not found with id: " + id));

        entity.setStatus(SOSStatus.APPROVED);
        SOSRequestEntity updated = sosRequestRepository.save(entity);
        return sosRequestMapper.entityToResponse(updated);
    }

    /**
     * Seeds realistic emergency SOS requests into the database for demonstration and testing.
     */
    @Transactional
    public List<SOSRequestResponse> seedSampleRequests(int count) {
        int safeCount = Math.max(1, Math.min(count, 500));
        List<SOSRequestEntity> entities = generateSyntheticRequests(safeCount);
        List<SOSRequestEntity> saved = sosRequestRepository.saveAll(entities);
        return saved.stream().map(sosRequestMapper::entityToResponse).toList();
    }

    /**
     * Generates on-demand synthetic datasets for algorithmic benchmark experiments (50 - 500 items).
     */
    public List<SOSRequest> generateBenchmarkItems(int count) {
        int safeCount = Math.max(1, Math.min(count, 500));
        List<SOSRequestEntity> entities = generateSyntheticRequests(safeCount);
        return sosRequestMapper.toDomainList(entities);
    }

    private List<SOSRequest> loadRequests(DecisionRequest request) {
        // If direct simulation requests are supplied in payload, use them
        if (request.getDirectRequests() != null && !request.getDirectRequests().isEmpty()) {
            List<SOSRequest> list = new ArrayList<>();
            long autoId = 1L;
            for (CreateSOSRequest req : request.getDirectRequests()) {
                validateCreateRequest(req);
                list.add(sosRequestMapper.fromCreateRequest(req, autoId++));
            }
            return list;
        }

        // If specific IDs requested, load those
        if (request.getRequestIds() != null && !request.getRequestIds().isEmpty()) {
            List<SOSRequestEntity> entities = sosRequestRepository.findAllById(request.getRequestIds());
            if (entities.size() != request.getRequestIds().size()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "One or more SOS request IDs were not found");
            }
            return sosRequestMapper.toDomainList(entities);
        }

        // Default: Load all PENDING requests from database
        List<SOSRequestEntity> pendingEntities = sosRequestRepository.findAllByStatusOrderByIdAsc(SOSStatus.PENDING);
        if (pendingEntities.isEmpty()) {
            // If database is currently empty, provide a standard initial sample set
            List<SOSRequestEntity> initialSet = generateSyntheticRequests(10);
            pendingEntities = sosRequestRepository.saveAll(initialSet);
        }

        return sosRequestMapper.toDomainList(pendingEntities);
    }

    private DecisionCriteriaWeights extractWeights(DecisionRequest request) {
        return DecisionCriteriaWeights.builder()
                .severityWeight(request.getSeverityWeight() > 0 ? request.getSeverityWeight() : 0.50)
                .populationWeight(request.getPopulationWeight() > 0 ? request.getPopulationWeight() : 0.30)
                .shortageWeight(request.getShortageWeight() > 0 ? request.getShortageWeight() : 0.20)
                .build()
                .normalized();
    }

    private void validateDecisionRequest(DecisionRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision request cannot be null");
        }
        if (request.getMaxDailyCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "maxDailyCapacity must be greater than 0");
        }
    }

    private void validateCreateRequest(CreateSOSRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SOS request body cannot be null");
        }
        if (req.getCampId() == null || req.getCampId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid campId is required");
        }
        if (req.getInjurySeverity() < 1 || req.getInjurySeverity() > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "injurySeverity must be between 1 and 10");
        }
        if (req.getPopulation() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "population must be positive");
        }
        if (req.getSupplyShortage() < 0 || req.getSupplyShortage() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "supplyShortage must be between 0% and 100%");
        }
        if (req.getRequiredTrucks() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "requiredTrucks must be positive");
        }
    }

    private DecisionResultResponse toResultResponse(SubsetResult<SOSRequest> result, String algorithm, double maxDailyCapacity) {
        List<SOSRequestResponse> selectedResponses = result.getSelectedItems().stream()
                .map(sosRequestMapper::toResponse)
                .toList();

        double totalScore = Math.round(result.getTotalValue() * 100.0) / 100.0;
        double capacityUsed = Math.round(result.getTotalWeight() * 100.0) / 100.0;
        double durationMs = result.getExecutionTimeNanos() / 1_000_000.0;

        return DecisionResultResponse.builder()
                .algorithm(algorithm)
                .selectedRequests(selectedResponses)
                .totalScore(totalScore)
                .totalCapacityUsed(capacityUsed)
                .maxDailyCapacity(maxDailyCapacity)
                .totalSelectedCount(selectedResponses.size())
                .nodesExplored(result.getNodesExplored())
                .nodesPruned(result.getNodesPruned())
                .executionTimeNanos(result.getExecutionTimeNanos())
                .executionTimeFormatted(String.format("%.3f ms", durationMs))
                .build();
    }

    private List<SOSRequestEntity> generateSyntheticRequests(int count) {
        String[] campNames = {
                "Alpha Sector Camp", "Bravo Valley Shelter", "Charlie Hill Station", "Delta River Outpost",
                "Echo Ridge Haven", "Foxtrot Base", "Golf Mountain Camp", "Hotel Coastal Shelter",
                "India Forest Post", "Juliet North Station", "Kilo Oasis Camp", "Lima South Haven",
                "Mike Central Base", "November Highland Shelter", "Oscar Lowland Post", "Papa Border Camp",
                "Quebec Valley Post", "Romeo West Haven", "Sierra Hilltop Base", "Tango Point Camp"
        };

        Random random = new Random(42); // Fixed seed for reproducible benchmarks
        List<SOSRequestEntity> list = new ArrayList<>(count);

        for (int i = 1; i <= count; i++) {
            String name = campNames[(i - 1) % campNames.length] + (count > 20 ? " #" + i : "");
            double severity = 1.0 + random.nextDouble() * 9.0; // 1.0 - 10.0
            double population = 30 + random.nextInt(970);      // 30 - 1000
            double shortage = 10.0 + random.nextDouble() * 90.0;// 10% - 100%
            double trucks = 1.0 + random.nextInt(4);            // 1 - 4 trucks

            list.add(SOSRequestEntity.builder()
                    .campId((long) ((i % 50) + 1))
                    .campName(name)
                    .injurySeverity(Math.round(severity * 10.0) / 10.0)
                    .population(population)
                    .supplyShortage(Math.round(shortage * 10.0) / 10.0)
                    .requiredTrucks(trucks)
                    .status(SOSStatus.PENDING)
                    .receivedAt(LocalDateTime.now().minusMinutes(random.nextInt(360)))
                    .build());
        }

        return list;
    }
}
