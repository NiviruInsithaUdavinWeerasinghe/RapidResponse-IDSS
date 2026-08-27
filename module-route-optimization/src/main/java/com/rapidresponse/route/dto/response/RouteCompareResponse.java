package com.rapidresponse.route.dto.response;

public record RouteCompareResponse(
        RouteResponse dijkstra,
        RouteResponse astar,
        boolean samePath,
        int nodesExploredDelta
) {
}
