package com.rapidresponse.decision.algorithm;

import com.rapidresponse.decision.model.DecisionCriteriaWeights;
import com.rapidresponse.decision.model.SOSRequest;
import com.rapidresponse.shared.algorithm.SubsetResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Fast O(n log n) Weighted Scoring Heuristic Solver with configurable criteria weights
 * and strengthened 2-approximation combination.
 *
 * <p><strong>Workflow:</strong></p>
 * <ol>
 *   <li><strong>Normalization:</strong> Min-Max normalizes criteria (Injury Severity, Population, Supply Shortage)
 *       so that disparate scales (e.g. population up to 2000 vs severity 1-10) are appropriately scaled into [0, 1].</li>
 *   <li><strong>Composite Scoring:</strong> Computes the weighted priority score for each request using normalized weights:
 *       {@code score = w_sev * normSev + w_pop * normPop + w_short * normShort}.</li>
 *   <li><strong>Ratio-Greedy Pass:</strong> Pre-sorts requests by score-to-capacity ratio ({@code score / requiredTrucks})
 *       descending and greedily selects requests that fit within the remaining rescue capacity.</li>
 *   <li><strong>Single-Best Pass:</strong> Identifies the single feasible request with the highest composite priority score.</li>
 *   <li><strong>Strengthened Combination:</strong> Chooses {@code max(greedy_score, single_best_score)}, providing the
 *       established 1/2-approximation (50% guarantee) against the fractional LP relaxation.</li>
 * </ol>
 */
@Component
public class WeightedScoringSolver {

    /**
     * Solves the emergency SOS batch selection using the Weighted Scoring heuristic.
     *
     * @param requests list of pending SOS requests
     * @param maxDailyCapacity available rescue capacity (e.g. number of rescue trucks)
     * @param weights configurable MCDA criteria weights
     * @return SubsetResult containing selected SOS requests, total score, and timing metrics
     */
    public SubsetResult<SOSRequest> solve(List<SOSRequest> requests, double maxDailyCapacity, DecisionCriteriaWeights weights) {
        long startTime = System.nanoTime();

        if (requests == null || requests.isEmpty() || maxDailyCapacity <= 0) {
            return SubsetResult.<SOSRequest>builder()
                    .selectedItems(Collections.emptyList())
                    .totalValue(0.0)
                    .totalWeight(0.0)
                    .capacityUsed(0.0)
                    .nodesExplored(0)
                    .nodesPruned(0)
                    .executionTimeNanos(System.nanoTime() - startTime)
                    .build();
        }

        // 1. Normalize criteria and calculate composite scores for all requests
        List<SOSRequest> scoredRequests = normalizeAndScore(requests, weights);

        // 2. Ratio-Greedy Pass (sorted by score / weight ratio descending)
        List<SOSRequest> sortedByRatio = new ArrayList<>(scoredRequests);
        sortedByRatio.sort(Comparator.comparingDouble(this::getScoreToWeightRatio).reversed());

        List<SOSRequest> greedySelected = new ArrayList<>();
        double greedyScore = 0.0;
        double greedyCapacityUsed = 0.0;
        double remainingCapacity = maxDailyCapacity;

        for (SOSRequest req : sortedByRatio) {
            double reqCapacity = req.getWeight();
            if (reqCapacity <= remainingCapacity + 1e-9) {
                greedySelected.add(req);
                greedyScore += req.getValue();
                greedyCapacityUsed += reqCapacity;
                remainingCapacity -= reqCapacity;
            }
        }

        // 3. Single-Best Pass: Find the single feasible request with highest score
        SOSRequest singleBestRequest = null;
        double singleBestScore = -1.0;

        for (SOSRequest req : scoredRequests) {
            if (req.getWeight() <= maxDailyCapacity + 1e-9) {
                if (req.getValue() > singleBestScore) {
                    singleBestScore = req.getValue();
                    singleBestRequest = req;
                }
            }
        }

        // 4. Strengthened Selection: max(greedyResult, singleBestResult)
        List<SOSRequest> finalSelected;
        double finalScore;
        double finalCapacityUsed;

        if (singleBestRequest != null && singleBestScore > greedyScore) {
            finalSelected = Collections.singletonList(singleBestRequest);
            finalScore = singleBestRequest.getValue();
            finalCapacityUsed = singleBestRequest.getWeight();
        } else {
            finalSelected = greedySelected;
            finalScore = greedyScore;
            finalCapacityUsed = greedyCapacityUsed;
        }

        long executionTimeNanos = System.nanoTime() - startTime;

        return SubsetResult.<SOSRequest>builder()
                .selectedItems(finalSelected)
                .totalValue(finalScore)
                .totalWeight(finalCapacityUsed)
                .capacityUsed(finalCapacityUsed)
                .nodesExplored(0)
                .nodesPruned(0)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }

    /**
     * Min-Max normalizes criteria across the input list and assigns composite scores.
     */
    public List<SOSRequest> normalizeAndScore(List<SOSRequest> requests, DecisionCriteriaWeights weights) {
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        DecisionCriteriaWeights normWeights = (weights != null ? weights : new DecisionCriteriaWeights()).normalized();

        double minSev = Double.MAX_VALUE, maxSev = Double.MIN_VALUE;
        double minPop = Double.MAX_VALUE, maxPop = Double.MIN_VALUE;
        double minShort = Double.MAX_VALUE, maxShort = Double.MIN_VALUE;

        for (SOSRequest req : requests) {
            minSev = Math.min(minSev, req.getInjurySeverity());
            maxSev = Math.max(maxSev, req.getInjurySeverity());
            minPop = Math.min(minPop, req.getPopulation());
            maxPop = Math.max(maxPop, req.getPopulation());
            minShort = Math.min(minShort, req.getSupplyShortage());
            maxShort = Math.max(maxShort, req.getSupplyShortage());
        }

        double sevRange = maxSev - minSev;
        double popRange = maxPop - minPop;
        double shortRange = maxShort - minShort;

        List<SOSRequest> result = new ArrayList<>(requests.size());

        for (SOSRequest req : requests) {
            double normSev = sevRange > 1e-9 ? (req.getInjurySeverity() - minSev) / sevRange : 1.0;
            double normPop = popRange > 1e-9 ? (req.getPopulation() - minPop) / popRange : 1.0;
            double normShort = shortRange > 1e-9 ? (req.getSupplyShortage() - minShort) / shortRange : 1.0;

            double compositeScore = (normWeights.getSeverityWeight() * normSev)
                    + (normWeights.getPopulationWeight() * normPop)
                    + (normWeights.getShortageWeight() * normShort);

            // Scale score to a meaningful priority scale (e.g. 0 - 100 for intuitive presentation)
            double scaledScore = compositeScore * 100.0;

            SOSRequest scored = SOSRequest.builder()
                    .id(req.getId())
                    .campId(req.getCampId())
                    .campName(req.getCampName())
                    .injurySeverity(req.getInjurySeverity())
                    .population(req.getPopulation())
                    .supplyShortage(req.getSupplyShortage())
                    .requiredTrucks(req.getRequiredTrucks())
                    .status(req.getStatus())
                    .receivedAt(req.getReceivedAt())
                    .normalizedSeverity(normSev)
                    .normalizedPopulation(normPop)
                    .normalizedShortage(normShort)
                    .compositeScore(scaledScore)
                    .build();

            result.add(scored);
        }

        return result;
    }

    private double getScoreToWeightRatio(SOSRequest req) {
        if (req.getWeight() <= 0) {
            return Double.POSITIVE_INFINITY;
        }
        return req.getValue() / req.getWeight();
    }
}
