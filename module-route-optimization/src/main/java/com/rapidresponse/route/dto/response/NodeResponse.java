package com.rapidresponse.route.dto.response;

import com.rapidresponse.shared.model.NodeType;

public record NodeResponse(
        Long id,
        String name,
        double latitude,
        double longitude,
        NodeType nodeType
) {
}
