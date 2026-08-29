package com.rapidresponse.shared.benchmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkDataPoint {

    private int inputSize;
    private double avgExecutionTimeMs;
    private double minExecutionTimeMs;
    private double maxExecutionTimeMs;
    private double solutionQuality;
}