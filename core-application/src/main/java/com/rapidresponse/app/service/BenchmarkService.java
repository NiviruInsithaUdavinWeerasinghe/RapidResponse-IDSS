package com.rapidresponse.app.service;

import com.rapidresponse.app.dto.request.BenchmarkRunRequest;
import com.rapidresponse.decision.algorithm.WeightedScoringSolver;
import com.rapidresponse.decision.model.DecisionCriteriaWeights;
import com.rapidresponse.decision.model.SOSRequest;
import com.rapidresponse.decision.service.DecisionService;
import com.rapidresponse.resource.model.ReliefItem;
import com.rapidresponse.route.algorithm.AStarPathfinder;
import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import com.rapidresponse.route.model.PathResult;
import com.rapidresponse.sequencing.algorithm.HeldKarpTSP;
import com.rapidresponse.sequencing.algorithm.TourResult;
import com.rapidresponse.sequencing.algorithm.TwoOptLocalSearch;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;
import com.rapidresponse.shared.algorithm.SubsetResult;
import com.rapidresponse.shared.benchmark.BenchmarkComparisonReport;
import com.rapidresponse.shared.benchmark.BenchmarkHarness;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class BenchmarkService {

    public static final int[] DEFAULT_INPUT_SIZES = BenchmarkHarness.DEFAULT_INPUT_SIZES;
    public static final int DEFAULT_REPETITIONS = BenchmarkHarness.DEFAULT_REPETITIONS;

    private static final int MAX_EXACT_BRANCH_AND_BOUND_SIZE = 24;

    public static final String ROUTE_PAIR = "ROUTE_DIJKSTRA_VS_ASTAR";
    public static final String RESOURCE_PAIR = "RESOURCE_BNB_VS_GREEDY";
    public static final String DECISION_PAIR = "DECISION_BNB_VS_WEIGHTED_SCORING";
    public static final String SEQUENCING_PAIR = "SEQUENCING_HELDKARP_VS_TWOOPT";

    private final BenchmarkHarness harness = new BenchmarkHarness();

    private final DijkstraPathfinder dijkstraPathfinder;
    private final AStarPathfinder aStarPathfinder;
    private final BranchAndBoundSolver<ReliefItem> resourceBranchAndBoundSolver;
    private final GreedySubsetSolver<ReliefItem> resourceGreedySolver;
    private final DecisionService decisionService;
    private final WeightedScoringSolver weightedScoringSolver;
    private final BranchAndBoundSolver<SOSRequest> decisionBranchAndBoundSolver;
    private final HeldKarpTSP heldKarpTSP = new HeldKarpTSP();
    private final TwoOptLocalSearch twoOptLocalSearch = new TwoOptLocalSearch();

    public BenchmarkService(DijkstraPathfinder dijkstraPathfinder,
                            AStarPathfinder aStarPathfinder,
                            BranchAndBoundSolver<ReliefItem> resourceBranchAndBoundSolver,
                            GreedySubsetSolver<ReliefItem> resourceGreedySolver,
                            DecisionService decisionService,
                            WeightedScoringSolver weightedScoringSolver,
                            BranchAndBoundSolver<SOSRequest> decisionBranchAndBoundSolver) {
        this.dijkstraPathfinder = dijkstraPathfinder;
        this.aStarPathfinder = aStarPathfinder;
        this.resourceBranchAndBoundSolver = resourceBranchAndBoundSolver;
        this.resourceGreedySolver = resourceGreedySolver;
        this.decisionService = decisionService;
        this.weightedScoringSolver = weightedScoringSolver;
        this.decisionBranchAndBoundSolver = decisionBranchAndBoundSolver;
    }

    public List<String> listAvailablePairs() {
        return List.of(ROUTE_PAIR, RESOURCE_PAIR, DECISION_PAIR, SEQUENCING_PAIR);
    }

    public BenchmarkComparisonReport run(BenchmarkRunRequest request) {
        if (request == null || request.algorithmPair() == null || request.algorithmPair().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "algorithmPair is required");
        }

        int[] inputSizes = resolveInputSizes(request);
        int repetitions = (request.repetitions() != null && request.repetitions() > 0)
                ? request.repetitions() : DEFAULT_REPETITIONS;

        String pair = request.algorithmPair().toUpperCase();
        if (ROUTE_PAIR.equals(pair)) {
            return benchmarkRoute(inputSizes, repetitions);
        } else if (RESOURCE_PAIR.equals(pair)) {
            return benchmarkResource(inputSizes, repetitions);
        } else if (DECISION_PAIR.equals(pair)) {
            return benchmarkDecision(inputSizes, repetitions);
        } else if (SEQUENCING_PAIR.equals(pair)) {
            return benchmarkSequencing(inputSizes, repetitions);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown algorithmPair: " + request.algorithmPair() + ". Available: " + listAvailablePairs());
        }
    }

    private int[] resolveInputSizes(BenchmarkRunRequest request) {
        if (request.inputSizes() == null || request.inputSizes().isEmpty()) {
            return DEFAULT_INPUT_SIZES;
        }
        return request.inputSizes().stream().mapToInt(Integer::intValue).toArray();
    }

    // ── Module 1: Dijkstra vs A* ─────────────────────────────────────────────────────────

    private BenchmarkComparisonReport benchmarkRoute(int[] inputSizes, int repetitions) {
        return harness.runComparativeScalabilitySweep(
                "dijkstra",
                size -> {
                    Graph graph = buildSyntheticRoadGraph(size);
                    return dijkstraPathfinder.findShortestPath(graph, 1L, (long) Math.max(2, size));
                },
                "astar",
                size -> {
                    Graph graph = buildSyntheticRoadGraph(size);
                    return aStarPathfinder.findShortestPath(graph, 1L, (long) Math.max(2, size));
                },
                inputSizes,
                repetitions,
                PathResult::getExecutionTimeNanos,
                PathResult::getTotalDistanceKm
        );
    }


    private Graph buildSyntheticRoadGraph(int size) {
        int n = Math.max(2, size);
        Random random = new Random(1000L + n);
        Graph graph = new Graph();

        for (long id = 1; id <= n; id++) {
            double lat = 7.0 + random.nextDouble() * 2.0;
            double lon = 80.0 + random.nextDouble() * 2.0;
            NodeType type = (id == 1) ? NodeType.HQ : NodeType.RESCUE_CAMP;
            graph.addNode(new Node(id, "Node-" + id, lat, lon, type));
        }

        for (long id = 1; id < n; id++) {
            graph.addUndirectedEdge(id, id + 1, 1.0 + random.nextDouble() * 9.0, 1.0 + random.nextDouble() * 15.0);
        }

        int extraEdges = Math.min(n * 2, 500);
        for (int i = 0; i < extraEdges; i++) {
            long a = 1 + random.nextInt(n);
            long b = 1 + random.nextInt(n);
            if (a != b) {
                graph.addUndirectedEdge(a, b, 1.0 + random.nextDouble() * 9.0, 1.0 + random.nextDouble() * 15.0);
            }
        }

        return graph;
    }

    // ── Module 2: Branch & Bound vs Greedy (Resource Allocation / Knapsack) ─────────────

    private BenchmarkComparisonReport benchmarkResource(int[] inputSizes, int repetitions) {
        return harness.runComparativeScalabilitySweep(
                "branch_and_bound",
                size -> {
                    if (size > MAX_EXACT_BRANCH_AND_BOUND_SIZE) {
                        throw new IllegalStateException(
                                "Branch & Bound skipped for n=" + size + " (limit=" + MAX_EXACT_BRANCH_AND_BOUND_SIZE
                                        + ") to keep benchmark runtime bounded.");
                    }
                    return resourceBranchAndBoundSolver.solve(
                            generateSyntheticReliefItems(size), syntheticCapacityFor(size));
                },
                "greedy",
                size -> resourceGreedySolver.solve(
                        generateSyntheticReliefItems(size), syntheticCapacityFor(size)),
                inputSizes,
                repetitions,
                SubsetResult::getExecutionTimeNanos,
                SubsetResult::getTotalValue
        );
    }

    private List<ReliefItem> generateSyntheticReliefItems(int size) {
        Random random = new Random(2000L + size);
        List<ReliefItem> items = new ArrayList<>(size);
        for (int i = 1; i <= size; i++) {
            ReliefItem item = new ReliefItem();
            item.setId((long) i);
            item.setName("Synthetic Item " + i);
            item.setWeightKg(1.0 + random.nextInt(50));
            item.setPriorityValue(1.0 + random.nextInt(100));
            items.add(item);
        }
        return items;
    }

    private double syntheticCapacityFor(int size) {
        return Math.max(10.0, size * 25.0 * 0.4);
    }

    // ── Module 4: Branch & Bound vs Weighted Scoring (Intelligent Decision) ─────────────

    private BenchmarkComparisonReport benchmarkDecision(int[] inputSizes, int repetitions) {
        DecisionCriteriaWeights weights = new DecisionCriteriaWeights();

        return harness.runComparativeScalabilitySweep(
                "branch_and_bound",
                size -> {
                    if (size > MAX_EXACT_BRANCH_AND_BOUND_SIZE) {
                        throw new IllegalStateException(
                                "Branch & Bound skipped for n=" + size + " (limit=" + MAX_EXACT_BRANCH_AND_BOUND_SIZE
                                        + ") to keep benchmark runtime bounded.");
                    }
                    List<SOSRequest> scored = weightedScoringSolver.normalizeAndScore(
                            decisionService.generateBenchmarkItems(size), weights);
                    return decisionBranchAndBoundSolver.solve(scored, syntheticTruckCapacityFor(size));
                },
                "weighted_scoring",
                size -> weightedScoringSolver.solve(
                        decisionService.generateBenchmarkItems(size), syntheticTruckCapacityFor(size), weights),
                inputSizes,
                repetitions,
                SubsetResult::getExecutionTimeNanos,
                SubsetResult::getTotalValue
        );
    }

    private double syntheticTruckCapacityFor(int size) {
        return Math.max(2.0, size * 2.5 * 0.4);
    }

    // ── Module 5: Held-Karp vs 2-opt (Route Sequencing / TSP) ────────────────────────────

    private BenchmarkComparisonReport benchmarkSequencing(int[] inputSizes, int repetitions) {
        return harness.runComparativeScalabilitySweep(
                "held_karp",
                size -> heldKarpTSP.findOptimalTour(buildSyntheticDistanceMatrix(size), 0),
                "two_opt",
                size -> twoOptLocalSearch.findOptimalTour(buildSyntheticDistanceMatrix(size), 0),
                inputSizes,
                repetitions,
                TourResult::getExecutionTimeNanos,
                TourResult::getTotalDistance
        );
    }

    private double[][] buildSyntheticDistanceMatrix(int size) {
        int n = Math.max(2, size);
        Random random = new Random(3000L + n);
        double[] xs = new double[n];
        double[] ys = new double[n];
        for (int i = 0; i < n; i++) {
            xs[i] = random.nextDouble() * 100.0;
            ys[i] = random.nextDouble() * 100.0;
        }

        double[][] matrix = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    matrix[i][j] = 0.0;
                } else {
                    double dx = xs[i] - xs[j];
                    double dy = ys[i] - ys[j];
                    matrix[i][j] = Math.sqrt(dx * dx + dy * dy);
                }
            }
        }
        return matrix;
    }
}