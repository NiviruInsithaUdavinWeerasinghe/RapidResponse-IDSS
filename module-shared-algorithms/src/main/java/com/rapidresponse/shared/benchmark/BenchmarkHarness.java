package com.rapidresponse.shared.benchmark;

import com.rapidresponse.shared.algorithm.SubsetResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.IntFunction;
import java.util.function.ToDoubleFunction;
import java.util.function.ToLongFunction;

public class BenchmarkHarness {

    public static final int[] DEFAULT_INPUT_SIZES = {10, 20, 50, 100, 200, 500, 1000};
    public static final int DEFAULT_REPETITIONS = 10;

    public BenchmarkReport runScalabilitySweep(String algorithmName,
                                               IntFunction<SubsetResult<?>> algorithmRunner,
                                               int[] inputSizes,
                                               int repetitions) {
        return runGenericScalabilitySweep(
                algorithmName,
                algorithmRunner,
                inputSizes,
                repetitions,
                SubsetResult::getExecutionTimeNanos,
                SubsetResult::getTotalValue
        );
    }

    /** Convenience overload using {@link #DEFAULT_INPUT_SIZES} and {@link #DEFAULT_REPETITIONS}. */
    public BenchmarkReport runScalabilitySweep(String algorithmName,
                                               IntFunction<SubsetResult<?>> algorithmRunner) {
        return runScalabilitySweep(algorithmName, algorithmRunner, DEFAULT_INPUT_SIZES, DEFAULT_REPETITIONS);
    }

    public <R> BenchmarkReport runGenericScalabilitySweep(String algorithmName,
                                                          IntFunction<R> algorithmRunner,
                                                          int[] inputSizes,
                                                          int repetitions,
                                                          ToLongFunction<R> executionTimeNanosExtractor,
                                                          ToDoubleFunction<R> solutionValueExtractor) {
        validateSweepArgs(algorithmName, algorithmRunner, inputSizes, repetitions);
        Objects.requireNonNull(executionTimeNanosExtractor, "executionTimeNanosExtractor must not be null");
        Objects.requireNonNull(solutionValueExtractor, "solutionValueExtractor must not be null");

        List<BenchmarkDataPoint> dataPoints = new ArrayList<>();
        for (int inputSize : inputSizes) {
            RawMeasurement raw = measureRaw(algorithmRunner, inputSize, repetitions,
                    executionTimeNanosExtractor, solutionValueExtractor);
            if (raw != null) {
                dataPoints.add(toDataPoint(raw, 1.0));
            }
        }

        return BenchmarkReport.builder()
                .algorithmName(algorithmName)
                .dataPoints(dataPoints)
                .build();
    }

    public <R> BenchmarkComparisonReport runComparativeScalabilitySweep(
            String exactAlgorithmName,
            IntFunction<R> exactRunner,
            String heuristicAlgorithmName,
            IntFunction<R> heuristicRunner,
            int[] inputSizes,
            int repetitions,
            ToLongFunction<R> executionTimeNanosExtractor,
            ToDoubleFunction<R> solutionValueExtractor) {

        validateSweepArgs(exactAlgorithmName, exactRunner, inputSizes, repetitions);
        validateSweepArgs(heuristicAlgorithmName, heuristicRunner, inputSizes, repetitions);
        Objects.requireNonNull(executionTimeNanosExtractor, "executionTimeNanosExtractor must not be null");
        Objects.requireNonNull(solutionValueExtractor, "solutionValueExtractor must not be null");

        List<BenchmarkDataPoint> exactPoints = new ArrayList<>();
        List<BenchmarkDataPoint> heuristicPoints = new ArrayList<>();

        for (int inputSize : inputSizes) {
            RawMeasurement exactRaw = measureRaw(exactRunner, inputSize, repetitions,
                    executionTimeNanosExtractor, solutionValueExtractor);
            RawMeasurement heuristicRaw = measureRaw(heuristicRunner, inputSize, repetitions,
                    executionTimeNanosExtractor, solutionValueExtractor);

            if (exactRaw != null) {
                exactPoints.add(toDataPoint(exactRaw, 1.0));
            }

            if (heuristicRaw != null) {
                double quality = (exactRaw != null && exactRaw.avgSolutionValue != 0.0)
                        ? heuristicRaw.avgSolutionValue / exactRaw.avgSolutionValue
                        : Double.NaN;
                heuristicPoints.add(toDataPoint(heuristicRaw, quality));
            }
        }

        return BenchmarkComparisonReport.builder()
                .exact(BenchmarkReport.builder().algorithmName(exactAlgorithmName).dataPoints(exactPoints).build())
                .heuristic(BenchmarkReport.builder().algorithmName(heuristicAlgorithmName).dataPoints(heuristicPoints).build())
                .build();
    }


    private <R> RawMeasurement measureRaw(IntFunction<R> algorithmRunner,
                                          int inputSize,
                                          int repetitions,
                                          ToLongFunction<R> timeExtractor,
                                          ToDoubleFunction<R> valueExtractor) {
        double[] timesMs = new double[repetitions];
        double valueSum = 0.0;

        try {
            for (int i = 0; i < repetitions; i++) {
                R result = algorithmRunner.apply(inputSize);
                timesMs[i] = timeExtractor.applyAsLong(result) / 1_000_000.0;
                valueSum += valueExtractor.applyAsDouble(result);
            }
        } catch (RuntimeException ex) {
            return null;
        }

        double sum = 0.0;
        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        for (double t : timesMs) {
            sum += t;
            min = Math.min(min, t);
            max = Math.max(max, t);
        }

        return new RawMeasurement(inputSize, sum / repetitions, min, max, valueSum / repetitions);
    }

    private BenchmarkDataPoint toDataPoint(RawMeasurement raw, double solutionQuality) {
        return BenchmarkDataPoint.builder()
                .inputSize(raw.inputSize)
                .avgExecutionTimeMs(raw.avgTimeMs)
                .minExecutionTimeMs(raw.minTimeMs)
                .maxExecutionTimeMs(raw.maxTimeMs)
                .solutionQuality(solutionQuality)
                .build();
    }

    private void validateSweepArgs(String algorithmName, Object algorithmRunner, int[] inputSizes, int repetitions) {
        Objects.requireNonNull(algorithmName, "algorithmName must not be null");
        Objects.requireNonNull(algorithmRunner, "algorithmRunner must not be null");
        Objects.requireNonNull(inputSizes, "inputSizes must not be null");
        if (inputSizes.length == 0) {
            throw new IllegalArgumentException("inputSizes must not be empty");
        }
        if (repetitions <= 0) {
            throw new IllegalArgumentException("repetitions must be greater than 0, got: " + repetitions);
        }
    }

    private static final class RawMeasurement {
        final int inputSize;
        final double avgTimeMs;
        final double minTimeMs;
        final double maxTimeMs;
        final double avgSolutionValue;

        RawMeasurement(int inputSize, double avgTimeMs, double minTimeMs, double maxTimeMs, double avgSolutionValue) {
            this.inputSize = inputSize;
            this.avgTimeMs = avgTimeMs;
            this.minTimeMs = minTimeMs;
            this.maxTimeMs = maxTimeMs;
            this.avgSolutionValue = avgSolutionValue;
        }
    }
}