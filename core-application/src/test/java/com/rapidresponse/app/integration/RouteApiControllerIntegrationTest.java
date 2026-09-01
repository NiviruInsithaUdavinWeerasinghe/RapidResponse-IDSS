package com.rapidresponse.app.integration;

import com.rapidresponse.route.dto.request.RouteRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RouteApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Module 1: POST /api/v1/routes/dijkstra - Computes shortest path from HQ to Camp 4")
    void testDijkstra_Success() throws Exception {
        RouteRequest request = new RouteRequest(1L, 4L);

        mockMvc.perform(post("/api/v1/routes/dijkstra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("dijkstra")))
                .andExpect(jsonPath("$.pathResult.totalDistanceKm", greaterThan(0.0)))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasItem(1)))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasItem(4)))
                .andExpect(jsonPath("$.pathResult.nodesExplored", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Module 1: POST /api/v1/routes/astar - Computes A* shortest path with geographic heuristic")
    void testAstar_Success() throws Exception {
        RouteRequest request = new RouteRequest(1L, 3L);

        mockMvc.perform(post("/api/v1/routes/astar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("astar")))
                .andExpect(jsonPath("$.pathResult.totalDistanceKm", greaterThan(0.0)))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasItem(1)))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasItem(3)));
    }

    @Test
    @DisplayName("Module 1: POST /api/v1/routes/compare - Compares Dijkstra vs A* side-by-side")
    void testCompare_Success() throws Exception {
        RouteRequest request = new RouteRequest(1L, 4L);

        mockMvc.perform(post("/api/v1/routes/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dijkstra").exists())
                .andExpect(jsonPath("$.astar").exists())
                .andExpect(jsonPath("$.samePath").isBoolean());
    }

    @Test
    @DisplayName("Module 1: GET /api/v1/routes/nodes - Lists all network nodes")
    void testListNodes_Success() throws Exception {
        mockMvc.perform(get("/api/v1/routes/nodes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[0].name", is("Central HQ Depot")));
    }

    @Test
    @DisplayName("Module 1: GET /api/v1/routes/nodes/{id}/neighbors - Returns adjacent road links")
    void testGetNeighbors_Success() throws Exception {
        mockMvc.perform(get("/api/v1/routes/nodes/1/neighbors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Module 1: POST /api/v1/routes/dijkstra - Returns 404 on nonexistent node")
    void testDijkstra_NonExistentNode_404() throws Exception {
        RouteRequest request = new RouteRequest(1L, 9999L);

        mockMvc.perform(post("/api/v1/routes/dijkstra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Module 1: POST /api/v1/routes/dijkstra - Returns 400 on null source node ID")
    void testDijkstra_ValidationError_400() throws Exception {
        RouteRequest request = new RouteRequest(null, 4L);

        mockMvc.perform(post("/api/v1/routes/dijkstra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
