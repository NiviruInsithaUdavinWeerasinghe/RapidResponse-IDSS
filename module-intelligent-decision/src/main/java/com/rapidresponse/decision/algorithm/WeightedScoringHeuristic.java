package com.rapidresponse.decision.algorithm;

import com.rapidresponse.decision.entity.SOSRequestEntity;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class WeightedScoringHeuristic {

    public ScoringResult score(
            List<SOSRequestEntity> requests,
            double maxDailyCapacity,
            double w1,
            double w2,
            double w3
    ) {

        long startTime = System.nanoTime();

        if (requests == null) {
            throw new IllegalArgumentException("Requests cannot be null");
        }

        if (maxDailyCapacity < 0) {
            throw new IllegalArgumentException(
                    "Maximum daily capacity cannot be negative"
            );
        }

        if (requests.isEmpty()) {
            long executionTime = System.nanoTime() - startTime;

            return new ScoringResult(
                    new ArrayList<>(),
                    new ArrayList<>(),
                    0.0,
                    0.0,
                    executionTime
            );
        }

        /*
         * Step 1:
         * Calculate raw weighted scores.
         */
        List<RawScoredRequest> rawRequests = new ArrayList<>();

        double minScore = Double.POSITIVE_INFINITY;
        double maxScore = Double.NEGATIVE_INFINITY;

        for (SOSRequestEntity request : requests) {

            double rawScore =
                    w1 * request.getInjurySeverity()
                            + w2 * request.getCampPopulation()
                            + w3 * request.getSupplyShortageLevel();

            rawRequests.add(new RawScoredRequest(
                    request,
                    rawScore
            ));

            minScore = Math.min(minScore, rawScore);
            maxScore = Math.max(maxScore, rawScore);
        }

        /*
         * Step 2:
         * Min-max normalization.
         */
        double scoreRange = maxScore - minScore;

        List<ScoredRequest> rankedRequests = new ArrayList<>();

        for (RawScoredRequest rawRequest : rawRequests) {

            double normalizedScore;

            if (scoreRange == 0.0) {
                normalizedScore = 1.0;
            } else {
                normalizedScore =
                        (rawRequest.rawScore - minScore) / scoreRange;
            }

            SOSRequestEntity entity = rawRequest.entity;

            rankedRequests.add(
                    new ScoredRequest(
                            entity.getId(),
                            entity.getCampName(),
                            rawRequest.rawScore,
                            normalizedScore,
                            entity.getResourceCost()
                    )
            );
        }

        /*
         * Step 3:
         * Sort highest normalized score first.
         */
        rankedRequests.sort(
                Comparator.comparingDouble(
                        ScoredRequest::getNormalizedScore
                ).reversed()
        );

        /*
         * Step 4:
         * Greedy selection.
         */
        List<ScoredRequest> greedySelection = new ArrayList<>();

        double greedyCost = 0.0;
        double greedyScore = 0.0;

        for (ScoredRequest request : rankedRequests) {

            if (greedyCost + request.getResourceCost()
                    <= maxDailyCapacity) {

                greedySelection.add(request);

                greedyCost += request.getResourceCost();

                greedyScore += request.getNormalizedScore();
            }
        }

        /*
         * Step 5:
         * Find the single highest-scoring request
         * that can fit within the capacity.
         */
        ScoredRequest bestSingleRequest = null;

        for (ScoredRequest request : rankedRequests) {

            if (request.getResourceCost() <= maxDailyCapacity) {

                bestSingleRequest = request;
                break;
            }
        }

        /*
         * Step 6:
         * Compare greedy solution against the
         * best single feasible request.
         */
        List<ScoredRequest> selectedRequests;
        double totalScore;
        double totalCost;

        double singleScore = 0.0;
        double singleCost = 0.0;

        if (bestSingleRequest != null) {
            singleScore = bestSingleRequest.getNormalizedScore();
            singleCost = bestSingleRequest.getResourceCost();
        }

        if (singleScore > greedyScore) {

            selectedRequests = new ArrayList<>();
            selectedRequests.add(bestSingleRequest);

            totalScore = singleScore;
            totalCost = singleCost;

        } else {

            selectedRequests = greedySelection;

            totalScore = greedyScore;
            totalCost = greedyCost;
        }

        long executionTime = System.nanoTime() - startTime;

        return new ScoringResult(
                rankedRequests,
                selectedRequests,
                totalScore,
                totalCost,
                executionTime
        );
    }

    private static class RawScoredRequest {

        private final SOSRequestEntity entity;
        private final double rawScore;

        private RawScoredRequest(
                SOSRequestEntity entity,
                double rawScore
        ) {
            this.entity = entity;
            this.rawScore = rawScore;
        }
    }
}