package com.rapidresponse.network.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the reachability endpoint (BFS from HQ).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReachabilityResponse {
    private List<NodeInfo> reachableCamps;
    private List<NodeInfo> isolatedCamps;
    private int totalReachable;
    private long executionTimeNanos;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeInfo {
        private Long id;
        private String name;
        private String nodeType;
        private int hopDistance;
    }
}
