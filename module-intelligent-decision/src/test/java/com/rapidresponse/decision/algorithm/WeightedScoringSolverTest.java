package com.rapidresponse.decision.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.rapidresponse.decision.entity.SOSStatus;
import com.rapidresponse.decision.model.DecisionCriteriaWeights;
import com.rapidresponse.decision.model.SOSRequest;
import com.rapidresponse.shared.algorithm.SubsetResult;

class WeightedScoringSolverTest {

    private WeightedScoringSolver solver;

    @BeforeEach
    void setUp() {
        solver = new WeightedScoringSolver();
    }

    private SOSRequest request(long id, String name, double severity, double population,
                               double shortage, double trucks) {
        return SOSRequest.builder()
                .id(id)
                .campId(id)
                .campName(name)
                .injurySeverity(severity)
                .population(population)
                .supplyShortage(shortage)
                .requiredTrucks(trucks)
                .status(SOSStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Test 1 Min-Max normalization should scale each criterion into [0, 1]")
    void normalizeAndScore_shouldMinMaxNormalizeEachCriterion() {
        List<SOSRequest> requests = List.of(
                request(1L, "Low", 2.0, 100.0, 20.0, 1.0),
                request(2L, "Mid", 6.0, 550.0, 50.0, 1.0),
                request(3L, "High", 10.0, 1000.0, 80.0, 1.0)
        );

        DecisionCriteriaWeights weights = new DecisionCriteriaWeights(0.5, 0.3, 0.2);
        List<SOSRequest> scored = solver.normalizeAndScore(requests, weights);

        SOSRequest low = scored.get(0);
        SOSRequest mid = scored.get(1);
        SOSRequest high = scored.get(2);

        assertEquals(0.0, low.getNormalizedSeverity(), 1e-9, "minimum severity normalizes to 0");
        assertEquals(1.0, high.getNormalizedSeverity(), 1e-9, "maximum severity normalizes to 1");
        assertEquals(0.5, mid.getNormalizedSeverity(), 1e-9, "midpoint severity normalizes to 0.5");

        assertEquals(0.0, low.getNormalizedPopulation(), 1e-9);
        assertEquals(1.0, high.getNormalizedPopulation(), 1e-9);
        assertEquals(0.5, mid.getNormalizedPopulation(), 1e-9, "population midpoint (550 of 100-1000) normalizes to 0.5");

        assertEquals(0.0, low.getNormalizedShortage(), 1e-9);
        assertEquals(1.0, high.getNormalizedShortage(), 1e-9);
    }

    @Test
    @DisplayName("Test 2 Composite score should equal the weighted sum of normalized criteria, scaled to 100")
    void normalizeAndScore_shouldComputeExpectedCompositeScore() {
        List<SOSRequest> requests = List.of(
                request(1L, "A", 1.0, 100.0, 0.0, 1.0),
                request(2L, "B", 10.0, 1000.0, 100.0, 1.0)
        );

        DecisionCriteriaWeights weights = new DecisionCriteriaWeights(0.5, 0.3, 0.2);
        List<SOSRequest> scored = solver.normalizeAndScore(requests, weights);
        SOSRequest b = scored.stream().filter(r -> r.getId() == 2L).findFirst().orElseThrow();
        double expectedScoreB = (0.5 * 1.0 + 0.3 * 1.0 + 0.2 * 1.0) * 100.0;
        assertEquals(expectedScoreB, b.getCompositeScore(), 1e-6);

        SOSRequest a = scored.stream().filter(r -> r.getId() == 1L).findFirst().orElseThrow();
        assertEquals(0.0, a.getCompositeScore(), 1e-6);
    }

    @Test
    @DisplayName("Test 3 Identical criteria values across all requests should normalize to 1.0 (no division by zero)")
    void normalizeAndScore_identicalValues_shouldNormalizeToOneAndAvoidDivideByZero() {
        List<SOSRequest> requests = List.of(
                request(1L, "A", 5.0, 500.0, 50.0, 1.0),
                request(2L, "B", 5.0, 500.0, 50.0, 1.0)
        );

        List<SOSRequest> scored = solver.normalizeAndScore(requests, new DecisionCriteriaWeights());

        for (SOSRequest r : scored) {
            assertEquals(1.0, r.getNormalizedSeverity(), 1e-9);
            assertEquals(1.0, r.getNormalizedPopulation(), 1e-9);
            assertEquals(1.0, r.getNormalizedShortage(), 1e-9);
        }
    }

    @Test
    @DisplayName("Test 4 Null or default weights should fall back to normalized defaults (0.5/0.3/0.2)")
    void normalizeAndScore_nullWeights_shouldFallBackToDefaults() {
        List<SOSRequest> requests = List.of(
                request(1L, "A", 1.0, 100.0, 0.0, 1.0),
                request(2L, "B", 10.0, 1000.0, 100.0, 1.0)
        );

        List<SOSRequest> scored = solver.normalizeAndScore(requests, null);

        SOSRequest b = scored.stream().filter(r -> r.getId() == 2L).findFirst().orElseThrow();
        double expectedScoreB = (0.5 * 1.0 + 0.3 * 1.0 + 0.2 * 1.0) * 100.0;
        assertEquals(expectedScoreB, b.getCompositeScore(), 1e-6);
    }

    @Test
    @DisplayName("Test 5 Severity-dominant weighting should rank the high-severity camp first")
    void solve_severityDominantWeights_shouldFavorHighSeverityCamp() {
        SOSRequest highSeverity = request(1L, "High Severity", 10.0, 50.0, 10.0, 1.0);
        SOSRequest highPopulation = request(2L, "High Population", 2.0, 1000.0, 10.0, 1.0);
        List<SOSRequest> requests = List.of(highSeverity, highPopulation);

        DecisionCriteriaWeights severityWeights = new DecisionCriteriaWeights(0.8, 0.1, 0.1);
        SubsetResult<SOSRequest> result = solver.solve(requests, 1.0, severityWeights);

        assertEquals(1, result.getSelectedItems().size());
        assertEquals(1L, result.getSelectedItems().get(0).getId(),
                "severity-dominant weighting must select the high-severity camp");
    }

    @Test
    @DisplayName("Test 6 Population-dominant weighting should rank the high-population camp first")
    void solve_populationDominantWeights_shouldFavorHighPopulationCamp() {
        SOSRequest highSeverity = request(1L, "High Severity", 10.0, 50.0, 10.0, 1.0);
        SOSRequest highPopulation = request(2L, "High Population", 2.0, 1000.0, 10.0, 1.0);
        List<SOSRequest> requests = List.of(highSeverity, highPopulation);

        DecisionCriteriaWeights populationWeights = new DecisionCriteriaWeights(0.1, 0.8, 0.1);
        SubsetResult<SOSRequest> result = solver.solve(requests, 1.0, populationWeights);

        assertEquals(1, result.getSelectedItems().size());
        assertEquals(2L, result.getSelectedItems().get(0).getId(),
                "population-dominant weighting must select the high-population camp");
    }

    @Test
    @DisplayName("Test 7 Ranking order (by score-to-capacity ratio) should place highest-value feasible requests first")
    void solve_rankedRequests_shouldOrderByDescendingScoreToWeightRatio() {
        List<SOSRequest> requests = List.of(
                request(1L, "Low", 2.0, 100.0, 10.0, 1.0),
                request(2L, "Mid", 6.0, 500.0, 50.0, 1.0),
                request(3L, "High", 10.0, 1000.0, 90.0, 1.0)
        );

        DecisionCriteriaWeights weights = new DecisionCriteriaWeights(0.5, 0.3, 0.2);
        SubsetResult<SOSRequest> result = solver.solve(requests, 10.0, weights);

        // With generous capacity, all three fit; the greedy pass selects them
        // in ratio-descending order, so the highest composite score appears first.
        List<SOSRequest> selected = result.getSelectedItems();
        assertEquals(3, selected.size());
        assertTrue(selected.get(0).getCompositeScore() >= selected.get(1).getCompositeScore());
        assertTrue(selected.get(1).getCompositeScore() >= selected.get(2).getCompositeScore());
    }

    @Test
    @DisplayName("Test 8 Selected requests should never exceed the given capacity")
    void solve_shouldNeverExceedCapacity() {
        List<SOSRequest> requests = List.of(
                request(1L, "A", 9.0, 800.0, 90.0, 3.0),
                request(2L, "B", 4.0, 300.0, 40.0, 1.0),
                request(3L, "C", 8.5, 750.0, 85.0, 2.0),
                request(4L, "D", 3.0, 150.0, 20.0, 1.0),
                request(5L, "E", 7.5, 600.0, 75.0, 2.0)
        );

        SubsetResult<SOSRequest> result = solver.solve(requests, 4.0, new DecisionCriteriaWeights());

        assertTrue(result.getTotalWeight() <= 4.0 + 1e-9,
                "weighted-scoring selection must respect the capacity constraint");
    }
    @Test
    @DisplayName("Test 9 Solver should pick the single best item when it beats the greedy-ratio selection")
    void solve_shouldPreferSingleBestOverGreedyWhenHigherValue() {
        DecisionCriteriaWeights severityOnly = new DecisionCriteriaWeights(1.0, 0.0, 0.0);

        SOSRequest ratioWinner = request(1L, "Ratio Winner", 6.0, 1.0, 1.0, 5.0);   // score=50, weight=5, ratio=10
        SOSRequest lowValue = request(2L, "Low Value", 2.0, 1.0, 1.0, 1.0);         // score=0,  weight=1, ratio=0
        SOSRequest highestScore = request(3L, "Highest Score", 10.0, 1.0, 1.0, 10.0); // score=100, weight=10, ratio=10
        List<SOSRequest> requests = List.of(ratioWinner, lowValue, highestScore);

        SubsetResult<SOSRequest> result = solver.solve(requests, 10.0, severityOnly);

        assertEquals(1, result.getSelectedItems().size(),
                "the strengthened combination must select the single dominant item");
        assertEquals(3L, result.getSelectedItems().get(0).getId(),
                "single-best pass must override a lower-value greedy combination");
        assertEquals(100.0, result.getTotalValue(), 1e-6);
    }

    @Test
    @DisplayName("Test 10 Empty request list should return an empty, zero-value result")
    void solve_emptyRequestList_shouldReturnEmptyResult() {
        SubsetResult<SOSRequest> result = solver.solve(List.of(), 10.0, new DecisionCriteriaWeights());

        assertTrue(result.getSelectedItems().isEmpty());
        assertEquals(0.0, result.getTotalValue(), 1e-9);
        assertEquals(0.0, result.getTotalWeight(), 1e-9);
    }

    @Test
    @DisplayName("Test 11 Zero or negative capacity should return an empty result")
    void solve_zeroCapacity_shouldReturnEmptyResult() {
        List<SOSRequest> requests = List.of(request(1L, "A", 5.0, 500.0, 50.0, 1.0));

        SubsetResult<SOSRequest> zeroCap = solver.solve(requests, 0.0, new DecisionCriteriaWeights());
        SubsetResult<SOSRequest> negativeCap = solver.solve(requests, -5.0, new DecisionCriteriaWeights());

        assertTrue(zeroCap.getSelectedItems().isEmpty());
        assertTrue(negativeCap.getSelectedItems().isEmpty());
    }

    @Test
    @DisplayName("Test 12 normalizeAndScore on an empty list should return an empty list")
    void normalizeAndScore_emptyList_shouldReturnEmptyList() {
        List<SOSRequest> scored = solver.normalizeAndScore(List.of(), new DecisionCriteriaWeights());
        assertTrue(scored.isEmpty());
    }

    @Test
    @DisplayName("Test 13 Execution time should be recorded and non-negative")
    void solve_shouldRecordExecutionTime() {
        List<SOSRequest> requests = List.of(request(1L, "A", 5.0, 500.0, 50.0, 1.0));

        SubsetResult<SOSRequest> result = solver.solve(requests, 5.0, new DecisionCriteriaWeights());

        assertTrue(result.getExecutionTimeNanos() >= 0, "execution time must be recorded");
    }
}