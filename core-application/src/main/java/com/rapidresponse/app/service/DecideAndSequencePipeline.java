package com.rapidresponse.app.service;

import com.rapidresponse.app.dto.request.DecideAndSequenceRequest;
import com.rapidresponse.app.dto.response.DecideAndSequenceResponse;
import com.rapidresponse.app.dto.response.TourStopResponse;
import com.rapidresponse.decision.dto.request.DecisionRequest;
import com.rapidresponse.decision.dto.response.DecisionResultResponse;
import com.rapidresponse.decision.dto.response.SOSRequestResponse;
import com.rapidresponse.decision.service.DecisionService;
import com.rapidresponse.sequencing.algorithm.HeldKarpTSP;
import com.rapidresponse.sequencing.algorithm.TourResult;
import com.rapidresponse.sequencing.algorithm.TwoOptLocalSearch;
import com.rapidresponse.sequencing.service.DistanceMatrixBuilder;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Orchestrator pipeline connecting Module 4 (Intelligent Decision) and Module 5 (Route Sequencing).
 *
 * <p>Implements Issue #30: Approved Camps -> Delivery Tour.
 */
@Service
public class DecideAndSequencePipeline {

    private final DecisionService decisionService;
    private final DistanceMatrixBuilder distanceMatrixBuilder;

    public DecideAndSequencePipeline(DecisionService decisionService, DistanceMatrixBuilder distanceMatrixBuilder) {
        this.decisionService = decisionService;
        this.distanceMatrixBuilder = distanceMatrixBuilder;
    }

    /**
     * Executes the end-to-end Decide & Sequence pipeline.
     *
     * @param request configuration parameters for decision and TSP sequencing
     * @return combined response containing decision ranking, stop sequence, and tour distance
     */
    public DecideAndSequenceResponse execute(DecideAndSequenceRequest request) {
        long startTime = System.nanoTime();

        // ── Step 1: Execute Module 4 (Multi-Criteria SOS Optimization) ───────────
        double sevW = request.severityWeight() != null ? request.severityWeight() : 0.5;
        double popW = request.populationWeight() != null ? request.populationWeight() : 0.3;
        double shoW = request.shortageWeight() != null ? request.shortageWeight() : 0.2;

        DecisionRequest decisionRequest = new DecisionRequest(
                request.maxDailyCapacity(),
                sevW,
                popW,
                shoW,
                null,
                request.directRequests()
        );

        DecisionResultResponse decisionResult;
        if ("HEURISTIC".equalsIgnoreCase(request.decisionAlgorithm())) {
            decisionResult = decisionService.optimizeHeuristic(decisionRequest);
        } else {
            decisionResult = decisionService.optimizeExact(decisionRequest);
        }

        List<SOSRequestResponse> approvedCamps = decisionResult.getSelectedRequests();
        if (approvedCamps == null || approvedCamps.isEmpty()) {
            return new DecideAndSequenceResponse(
                    decisionResult,
                    List.of(),
                    0.0,
                    0,
                    "NONE",
                    "No camps selected within capacity limit.",
                    System.nanoTime() - startTime
            );
        }

        // ── Step 2: Extract Stop Node IDs and Construct Road Graph ───────────────
        Long depotId = request.depotNodeId() != null ? request.depotNodeId() : 1L;
        List<Long> stopNodeIds = new ArrayList<>();
        stopNodeIds.add(depotId);

        Map<Long, String> nodeNames = new HashMap<>();
        Map<Long, String> nodeTypes = new HashMap<>();
        nodeNames.put(depotId, "Central HQ Depot");
        nodeTypes.put(depotId, "HQ");

        Graph roadGraph = new Graph();
        roadGraph.addNode(new Node(depotId, "Central HQ Depot", 6.9271, 79.8612, NodeType.HQ));

        for (SOSRequestResponse camp : approvedCamps) {
            Long nodeId = camp.getCampId() != null ? camp.getCampId() : (camp.getId() + 100L);
            if (!stopNodeIds.contains(nodeId)) {
                stopNodeIds.add(nodeId);
                nodeNames.put(nodeId, camp.getCampName());
                nodeTypes.put(nodeId, "RESCUE_CAMP");
                // Base coordinates scattered around Colombo/Disaster region
                double lat = 6.9271 + ((camp.getId() * 7) % 50) * 0.01;
                double lon = 79.8612 + ((camp.getId() * 11) % 50) * 0.01;
                roadGraph.addNode(new Node(nodeId, camp.getCampName(), lat, lon, NodeType.RESCUE_CAMP));
            }
        }

        // Create road network edges between all nodes for complete connectivity
        int n = stopNodeIds.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Long u = stopNodeIds.get(i);
                Long v = stopNodeIds.get(j);
                Node nu = roadGraph.getNode(u);
                Node nv = roadGraph.getNode(v);

                // Euclidean distance approximation scaled to km
                double dLat = (nu.getLatitude() - nv.getLatitude()) * 111.0;
                double dLon = (nu.getLongitude() - nv.getLongitude()) * 111.0;
                double distKm = Math.max(1.5, Math.round(Math.sqrt(dLat * dLat + dLon * dLon) * 10.0) / 10.0);
                double timeMins = Math.round(distKm * 2.2 * 10.0) / 10.0;

                roadGraph.addUndirectedEdge(u, v, distKm, timeMins);
            }
        }

        // ── Step 3: Compute Pairwise Distance Matrix via Module 1 / Module 5 ─────
        double[][] distanceMatrix = distanceMatrixBuilder.buildMatrix(roadGraph, stopNodeIds);

        // ── Step 4: Execute TSP Tour Sequencer (Held-Karp vs 2-Opt) ──────────────
        TourResult tourResult;
        String algorithmUsed;

        boolean forceHeldKarp = "HELD_KARP".equalsIgnoreCase(request.sequencingAlgorithm());
        boolean forceTwoOpt = "TWO_OPT".equalsIgnoreCase(request.sequencingAlgorithm());

        if (n < 2) {
            tourResult = TourResult.builder()
                    .tourSequence(List.of(0, 0))
                    .totalDistance(0.0)
                    .problemSize(n)
                    .executionTimeNanos(0L)
                    .build();
            algorithmUsed = "TRIVIAL";
        } else if ((forceHeldKarp || (!forceTwoOpt && n <= HeldKarpTSP.MAX_NODES))) {
            HeldKarpTSP heldKarp = new HeldKarpTSP();
            tourResult = heldKarp.findOptimalTour(distanceMatrix, 0);
            algorithmUsed = "Held-Karp (Exact Dynamic Programming)";
        } else {
            TwoOptLocalSearch twoOpt = new TwoOptLocalSearch();
            tourResult = twoOpt.findOptimalTour(distanceMatrix, 0);
            algorithmUsed = "2-Opt Local Search (Heuristic)";
        }

        // ── Step 5: Map Indices Back to TourStopResponse Objects ─────────────────
        List<TourStopResponse> tourSequence = new ArrayList<>();
        List<Integer> indexSequence = tourResult.getTourSequence();

        for (int i = 0; i < indexSequence.size(); i++) {
            int matrixIdx = indexSequence.get(i);
            Long nodeId = stopNodeIds.get(matrixIdx);
            double distFromPrev = 0.0;
            if (i > 0) {
                int prevMatrixIdx = indexSequence.get(i - 1);
                distFromPrev = distanceMatrix[prevMatrixIdx][matrixIdx];
            }

            tourSequence.add(new TourStopResponse(
                    i + 1,
                    nodeId,
                    nodeNames.getOrDefault(nodeId, "Camp #" + nodeId),
                    nodeTypes.getOrDefault(nodeId, "RESCUE_CAMP"),
                    Math.round(distFromPrev * 100.0) / 100.0
            ));
        }

        long totalPipelineTimeNanos = System.nanoTime() - startTime;

        String summary = String.format(
                "Decide & Sequence pipeline completed in %.2f ms. Selected %d camps (%d total stops including HQ). " +
                "Optimal delivery tour distance: %.2f km via %s.",
                totalPipelineTimeNanos / 1_000_000.0,
                approvedCamps.size(),
                stopNodeIds.size(),
                tourResult.getTotalDistance(),
                algorithmUsed
        );

        return new DecideAndSequenceResponse(
                decisionResult,
                tourSequence,
                Math.round(tourResult.getTotalDistance() * 100.0) / 100.0,
                tourSequence.size(),
                algorithmUsed,
                summary,
                totalPipelineTimeNanos
        );
    }
}
