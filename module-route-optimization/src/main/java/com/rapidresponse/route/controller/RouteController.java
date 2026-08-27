package com.rapidresponse.route.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rapidresponse.route.dto.request.RouteRequest;
import com.rapidresponse.route.dto.response.NeighborResponse;
import com.rapidresponse.route.dto.response.NodeResponse;
import com.rapidresponse.route.dto.response.RouteCompareResponse;
import com.rapidresponse.route.dto.response.RouteResponse;
import com.rapidresponse.route.service.RouteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/routes")
@Tag(name = "Route Optimization", description = "Endpoints for finding the shortest path (Dijkstra/A*)")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @Operation(summary = "Run Dijkstra from source to target")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Path computed (empty path if unreachable)"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Source or target node was not found")
    })
    @PostMapping({"/dijkstraRun", "/dijkstra"})
    public ResponseEntity<RouteResponse> dijkstra(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.findDijkstra(request));
    }

    @Operation(summary = "Run A* from source to target")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Path computed (empty path if unreachable)"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Source or target node was not found")
    })
    @PostMapping({"/astarRun", "/astar"})
    public ResponseEntity<RouteResponse> astar(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.findAstar(request));
    }

    @Operation(summary = "Run Dijkstra and A* and return a side-by-side comparison")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Both algorithms compared"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Source or target node was not found")
    })
    @PostMapping({"/compareRun", "/compare"})
    public ResponseEntity<RouteCompareResponse> compare(@Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.compare(request));
    }

    @Operation(summary = "List all nodes in the road network")
    @ApiResponse(responseCode = "200", description = "Network nodes")
    @GetMapping({"/nodesList", "/nodes"})
    public ResponseEntity<List<NodeResponse>> listNodes() {
        return ResponseEntity.ok(routeService.listNodes());
    }

    @Operation(summary = "Get neighbors of a specific node")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Outgoing neighbors"),
            @ApiResponse(responseCode = "404", description = "Node was not found")
    })
    @GetMapping("/nodes/{id}/neighbors")
    public ResponseEntity<List<NeighborResponse>> listNeighbors(@PathVariable("id") Long id) {
        return ResponseEntity.ok(routeService.listNeighbors(id));
    }
}
