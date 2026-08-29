package com.rapidresponse.network.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the connectivity-check endpoint (Union-Find).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectivityResponse {
    private Long sourceNodeId;
    private Long targetNodeId;
    private boolean connected;
    private int totalComponents;
}
