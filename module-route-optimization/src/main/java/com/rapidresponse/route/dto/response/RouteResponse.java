package com.rapidresponse.route.dto.response;

import java.util.List;

import com.rapidresponse.route.model.PathResult;

public record RouteResponse(
        String algorithm,
        PathResult pathResult,
        List<String> nodeNames,
        int graphNodeCount,
        int graphEdgeCount
) {
}
