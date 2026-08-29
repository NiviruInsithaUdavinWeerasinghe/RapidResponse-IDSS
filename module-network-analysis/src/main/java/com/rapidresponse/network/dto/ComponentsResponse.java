package com.rapidresponse.network.dto;

import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the connected-components endpoint (DFS).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComponentsResponse {
    private List<ComponentInfo> components;
    private int totalComponents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComponentInfo {
        private int id;
        private Set<Long> nodeIds;
        private int size;
    }
}
