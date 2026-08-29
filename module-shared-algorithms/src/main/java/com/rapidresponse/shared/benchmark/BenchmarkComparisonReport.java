package com.rapidresponse.shared.benchmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkComparisonReport {
    private BenchmarkReport exact;
    private BenchmarkReport heuristic;
}