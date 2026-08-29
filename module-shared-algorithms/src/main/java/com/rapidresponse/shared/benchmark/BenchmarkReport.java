package com.rapidresponse.shared.benchmark;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkReport {
    private String algorithmName;
    private List<BenchmarkDataPoint> dataPoints;
}