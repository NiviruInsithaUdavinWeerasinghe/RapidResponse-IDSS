package com.rapidresponse.network.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for the connectivity-check endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectivityRequest {
    private Long sourceNodeId;
    private Long targetNodeId;
}
