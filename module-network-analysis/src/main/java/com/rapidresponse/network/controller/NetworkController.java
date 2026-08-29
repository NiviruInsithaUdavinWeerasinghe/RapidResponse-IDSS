package com.rapidresponse.network.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rapidresponse.network.dto.ComponentsResponse;
import com.rapidresponse.network.dto.ConnectivityRequest;
import com.rapidresponse.network.dto.ConnectivityResponse;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.network.service.NetworkService;

/**
 * REST controller for Module 3 network integrity analysis endpoints.
 */
@RestController
@RequestMapping("/api/v1/network")
public class NetworkController {

    private final NetworkService networkService;

    public NetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    /**
     * Run BFS from HQ, return reachable and isolated camps.
     */
    @PostMapping("/reachability")
    public ResponseEntity<ReachabilityResponse> analyseReachability() {
        return ResponseEntity.ok(networkService.analyseReachability());
    }

    /**
     * Run DFS, return all connected components.
     */
    @PostMapping("/components")
    public ResponseEntity<ComponentsResponse> analyseComponents() {
        return ResponseEntity.ok(networkService.analyseComponents());
    }

    /**
     * Run Kruskal's MST, return roads to clear to reconnect the network.
     */
    @PostMapping("/mst")
    public ResponseEntity<MstResponse> computeMst() {
        return ResponseEntity.ok(networkService.computeMst());
    }

    /**
     * Use Union-Find to check if two nodes are connected (O(α(V)) after MST).
     */
    @PostMapping("/connectivity-check")
    public ResponseEntity<ConnectivityResponse> checkConnectivity(
            @RequestBody ConnectivityRequest request) {
        return ResponseEntity.ok(networkService.checkConnectivity(
                request.getSourceNodeId(), request.getTargetNodeId()));
    }
}
