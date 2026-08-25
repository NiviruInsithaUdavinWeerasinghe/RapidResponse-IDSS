package com.rapidresponse.sequencing.dto;

import java.util.List;

public record SequencingResponse(
    List<Long> tourNodeIds,
    List<String> tourNodeNames,
    double totalDistance,
    int problemSize,
    long executionTimeNanos
) {}
