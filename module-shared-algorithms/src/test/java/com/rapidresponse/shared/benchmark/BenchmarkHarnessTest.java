package com.rapidresponse.shared.benchmark;

import com.rapidresponse.shared.algorithm.SubsetResult;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class BenchmarkHarnessTest {

    private final BenchmarkHarness harness = new BenchmarkHarness();

    @Test
    void runScalabilitySweep_shouldProduceOneDataPointPerInputSize() {
        int[] sizes = {5, 10, 20};

        BenchmarkReport report = harness.runScalabilitySweep(
                "fake_algorithm",
                size -> fakeSubsetResult(size, size * 2L),
                sizes,
                4
        );

        assertEquals("fake_algorithm", report.getAlgorithmName());
        assertEquals(3, report.getDataPoints().size());
        for (int i = 0; i < sizes.length; i++) {
            assertEquals(sizes[i], report.getDataPoints().get(i).getInputSize());
        }
    }

    @Test
    void runScalabilitySweep_shouldComputeAvgMinMaxAcrossRepetitions() {
        int[] callCount = {0};

        BenchmarkReport report = harness.runScalabilitySweep(
                "variable_time_algorithm",
                size -> {
                    callCount[0]++;
                    return fakeSubsetResult(size, callCount[0] * 1_000_000L); // 1ms, 2ms, 3ms...
                },
                new int[]{1},
                5
        );

        BenchmarkDataPoint point = report.getDataPoints().get(0);
        assertEquals(1.0, point.getMinExecutionTimeMs(), 1e-6);
        assertEquals(5.0, point.getMaxExecutionTimeMs(), 1e-6);
        assertEquals(3.0, point.getAvgExecutionTimeMs(), 1e-6);
        assertEquals(1.0, point.getSolutionQuality(), 1e-9, "single-runner sweep reports quality as 1.0");
    }

    @Test
    void runComparativeScalabilitySweep_shouldComputeHeuristicToExactRatio() {
        BenchmarkComparisonReport report = harness.runComparativeScalabilitySweep(
                "exact",
                size -> fakeSubsetResult(100.0, 1_000_000L),
                "heuristic",
                size -> fakeSubsetResult(80.0, 500_000L),
                new int[]{10},
                3,
                SubsetResult::getExecutionTimeNanos,
                SubsetResult::getTotalValue
        );

        assertEquals(1.0, report.getExact().getDataPoints().get(0).getSolutionQuality(), 1e-6);
        assertEquals(0.8, report.getHeuristic().getDataPoints().get(0).getSolutionQuality(), 1e-6);
    }

    @Test
    void runComparativeScalabilitySweep_shouldSkipExactPointWhenRunnerThrows() {
        int maxExactSize = 18;

        BenchmarkComparisonReport report = harness.runComparativeScalabilitySweep(
                "exact_with_limit",
                size -> {
                    if (size > maxExactSize) {
                        throw new IllegalArgumentException("too large for exact solver");
                    }
                    return fakeSubsetResult(50.0, 100_000L);
                },
                "heuristic_no_limit",
                size -> fakeSubsetResult(45.0, 50_000L),
                new int[]{10, 20},
                2,
                SubsetResult::getExecutionTimeNanos,
                SubsetResult::getTotalValue
        );

        assertEquals(1, report.getExact().getDataPoints().size());
        assertEquals(10, report.getExact().getDataPoints().get(0).getInputSize());

        assertEquals(2, report.getHeuristic().getDataPoints().size());
        assertTrue(Double.isNaN(report.getHeuristic().getDataPoints().get(1).getSolutionQuality()),
                "no exact reference at size=20 means quality cannot be computed");
    }

    @Test
    void runScalabilitySweep_nullAlgorithmRunner_shouldThrow() {
        assertThrows(NullPointerException.class, () ->
                harness.runScalabilitySweep("x", null, new int[]{10}, 5));
    }

    @Test
    void runScalabilitySweep_emptyInputSizes_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () ->
                harness.runScalabilitySweep("x", size -> fakeSubsetResult(1.0, 1L), new int[]{}, 5));
    }

    @Test
    void runScalabilitySweep_zeroRepetitions_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () ->
                harness.runScalabilitySweep("x", size -> fakeSubsetResult(1.0, 1L), new int[]{10}, 0));
    }

    private static SubsetResult<Object> fakeSubsetResult(double totalValue, long executionTimeNanos) {
        return SubsetResult.builder()
                .selectedItems(Collections.emptyList())
                .totalValue(totalValue)
                .totalWeight(0.0)
                .capacityUsed(0.0)
                .nodesExplored(0)
                .nodesPruned(0)
                .executionTimeNanos(executionTimeNanos)
                .build();
    }
}