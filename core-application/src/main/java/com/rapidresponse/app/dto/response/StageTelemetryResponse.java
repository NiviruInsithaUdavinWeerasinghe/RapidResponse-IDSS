package com.rapidresponse.app.dto.response;

import java.util.Map;

/**
 * Detailed performance and telemetry diagnostics for the 5-stage Disaster Response Pipeline.
 *
 * <p>Implements Issue #31 pipeline stage diagnostics.
 */
public record StageTelemetryResponse(
        long networkAnalysisDurationNanos,
        long routePreCheckDurationNanos,
        long intelligentDecisionDurationNanos,
        long resourceAllocationDurationNanos,
        long routeSequencingDurationNanos,
        long totalPipelineDurationNanos,
        double totalExecutionTimeMs,
        Map<String, Long> stageTimings
) {

    /**
     * Factory helper to construct StageTelemetryResponse from stage timings map.
     */
    public static StageTelemetryResponse fromTimings(Map<String, Long> stageTimings, long totalTimeNanos) {
        long s1 = stageTimings.getOrDefault("Stage 1: Module 3 (Network Analysis)", 0L);
        long s2 = stageTimings.getOrDefault("Stage 2: Module 1 (Route Pre-Check)", 0L);
        long s3 = stageTimings.getOrDefault("Stage 3: Module 4 (Intelligent Decision)", 0L);
        long s4 = stageTimings.getOrDefault("Stage 4: Module 2 (Resource Packing)", 0L);
        long s5 = stageTimings.getOrDefault("Stage 5: Module 5 (Route Sequencing)", 0L);

        return new StageTelemetryResponse(
                s1,
                s2,
                s3,
                s4,
                s5,
                totalTimeNanos,
                Math.round((totalTimeNanos / 1_000_000.0) * 100.0) / 100.0,
                stageTimings
        );
    }
}
