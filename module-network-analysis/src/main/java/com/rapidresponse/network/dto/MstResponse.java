package com.rapidresponse.network.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the MST (Kruskal's) endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MstResponse {
    private List<MstEdge> roadsToClear;
    private double totalCost;
    private String componentsReduced;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MstEdge {
        private Long sourceNodeId;
        private Long targetNodeId;
        private double distanceKm;
        private double travelTimeMins;
    }
}
