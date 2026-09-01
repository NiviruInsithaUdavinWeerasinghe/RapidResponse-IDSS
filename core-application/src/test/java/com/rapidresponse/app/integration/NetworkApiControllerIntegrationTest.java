package com.rapidresponse.app.integration;

import com.rapidresponse.network.dto.ConnectivityRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class NetworkApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Module 3: POST /api/v1/network/reachability - BFS reachability analysis from HQ")
    void testAnalyseReachability_Success() throws Exception {
        mockMvc.perform(post("/api/v1/network/reachability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalReachable", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.reachableCamps", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Module 3: POST /api/v1/network/components - DFS connected components analysis")
    void testAnalyseComponents_Success() throws Exception {
        mockMvc.perform(post("/api/v1/network/components"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalComponents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.components", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Module 3: POST /api/v1/network/mst - Kruskal's MST analysis for road clearance")
    void testComputeMst_Success() throws Exception {
        mockMvc.perform(post("/api/v1/network/mst"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCost").exists())
                .andExpect(jsonPath("$.roadsToClear").isArray());
    }

    @Test
    @DisplayName("Module 3: GET /api/v1/network/edges - Retrieves all road segments from database")
    void testGetAllEdges_Success() throws Exception {
        mockMvc.perform(get("/api/v1/network/edges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    @DisplayName("Module 3: POST /api/v1/network/edges/toggle-block - Toggles blocked status of road segment")
    void testToggleEdgeBlock_Success() throws Exception {
        ConnectivityRequest req = new ConnectivityRequest(1L, 2L);

        mockMvc.perform(post("/api/v1/network/edges/toggle-block")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Module 3: POST /api/v1/network/edges/reset - Resets all roads to unblocked")
    void testResetAllEdges_Success() throws Exception {
        mockMvc.perform(post("/api/v1/network/edges/reset"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Module 3: POST /api/v1/network/connectivity-check - Union-Find instant component query")
    void testConnectivityCheck_Success() throws Exception {
        // Run MST first to cache Union-Find
        mockMvc.perform(post("/api/v1/network/mst")).andExpect(status().isOk());

        ConnectivityRequest req = new ConnectivityRequest(1L, 2L);

        mockMvc.perform(post("/api/v1/network/connectivity-check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").isBoolean());
    }
}
