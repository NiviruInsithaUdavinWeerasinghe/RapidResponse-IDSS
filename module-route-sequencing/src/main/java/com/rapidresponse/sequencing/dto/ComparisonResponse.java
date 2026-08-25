package com.rapidresponse.sequencing.dto;

public record ComparisonResponse(
    SequencingResponse exact,
    SequencingResponse heuristic,
    String optimalityGap
) {}
