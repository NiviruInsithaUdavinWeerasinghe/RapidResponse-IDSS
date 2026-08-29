package com.rapidresponse.network.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.network.dto.ComponentsResponse;
import com.rapidresponse.network.dto.ConnectivityRequest;
import com.rapidresponse.network.dto.ConnectivityResponse;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.network.service.NetworkService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

/**
 * REST controller for Module 3 network integrity analysis endpoints.
 */
@RestController
@RequestMapping("/api/v1/network")
@Tag(name = "Network Analysis", description = "Endpoints for disaster zone network integrity analysis")
public class NetworkController {

    private final NetworkService networkService;

    public NetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    /**
     * Run BFS from HQ, return reachable and isolated camps.
     */
    @PostMapping("/reachability")
    @Operation(summary = "Analyze network reachability", description = "Runs Breadth-First Search (BFS) from the HQ to find all physically reachable rescue camps.")
    @ApiResponse(responseCode = "200", description = "Successfully analyzed reachability")
    public ResponseEntity<ReachabilityResponse> analyseReachability() {
        return ResponseEntity.ok(networkService.analyseReachability());
    }

    /**
     * Run DFS, return all connected components.
     */
    @PostMapping("/components")
    @Operation(summary = "Discover connected components", description = "Runs Depth-First Search (DFS) to identify all disjoint sub-networks (components).")
    @ApiResponse(responseCode = "200", description = "Successfully discovered components")
    public ResponseEntity<ComponentsResponse> analyseComponents() {
        return ResponseEntity.ok(networkService.analyseComponents());
    }

    /**
     * Run Kruskal's MST, return roads to clear to reconnect the network.
     */
    @PostMapping("/mst")
    @Operation(summary = "Compute Minimum Spanning Tree (MST)", description = "Runs Kruskal's algorithm to determine the minimum-cost set of blocked roads to clear to fully reconnect the network.")
    @ApiResponse(responseCode = "200", description = "Successfully computed MST")
    public ResponseEntity<MstResponse> computeMst() {
        return ResponseEntity.ok(networkService.computeMst());
    }

    /**
     * Toggle blocked state of a road between source and target in the database.
     */
    @PostMapping("/edges/toggle-block")
    @Operation(summary = "Toggle blocked state of a road in the database", description = "Finds the road between source and target nodes and toggles its blocked status in the database.")
    public ResponseEntity<?> toggleEdgeBlock(@RequestBody ConnectivityRequest request) {
        networkService.toggleEdgeBlock(request.getSourceNodeId(), request.getTargetNodeId());
        return ResponseEntity.ok().build();
    }

    /**
     * Reset all roads to unblocked in the database.
     */
    @PostMapping("/edges/reset")
    @Operation(summary = "Reset all roads to unblocked state", description = "Resets all road segments in the database to unblocked.")
    public ResponseEntity<?> resetAllEdges() {
        networkService.resetAllEdges();
        return ResponseEntity.ok().build();
    }

    /**
     * Gets all edges/roads in the network from the database.
     */
    @GetMapping("/edges")
    @Operation(summary = "Get all roads/edges in the network", description = "Fetches all road segments including source/target node IDs and blocked statuses directly from the database.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all edges")
    public ResponseEntity<List<EdgeEntity>> getAllEdges() {
        return ResponseEntity.ok(networkService.getAllEdges());
    }



    /**
     * Use Union-Find to check if two nodes are connected (O(α(V)) after MST).
     */
    @PostMapping("/connectivity-check")
    @Operation(summary = "Check connectivity between two nodes", description = "Uses the Union-Find data structure (cached from the last MST run) to instantly check if two nodes are in the same component.")
    @ApiResponse(responseCode = "200", description = "Successfully checked connectivity")
    public ResponseEntity<?> checkConnectivity(
            @RequestBody ConnectivityRequest request) {
        try {
            return ResponseEntity.ok(networkService.checkConnectivity(
                    request.getSourceNodeId(), request.getTargetNodeId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
