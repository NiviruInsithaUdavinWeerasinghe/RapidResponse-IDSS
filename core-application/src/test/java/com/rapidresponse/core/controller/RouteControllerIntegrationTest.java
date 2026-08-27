package com.rapidresponse.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rapidresponse.route.dto.request.RouteRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql(scripts = "/data-route.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class RouteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testDijkstraRoute() throws Exception {
        RouteRequest request = new RouteRequest(1L, 3L);

        mockMvc.perform(post("/api/v1/routes/dijkstra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm").value("dijkstra"))
                .andExpect(jsonPath("$.pathResult.totalDistanceKm").value(40.0))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasSize(3)))
                .andExpect(jsonPath("$.pathResult.nodeSequence[0]").value(1))
                .andExpect(jsonPath("$.pathResult.nodeSequence[1]").value(2))
                .andExpect(jsonPath("$.pathResult.nodeSequence[2]").value(3));
    }

    @Test
    public void testAStarRoute() throws Exception {
        RouteRequest request = new RouteRequest(1L, 3L);

        mockMvc.perform(post("/api/v1/routes/astar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm").value("astar"))
                .andExpect(jsonPath("$.pathResult.totalDistanceKm").value(40.0))
                .andExpect(jsonPath("$.pathResult.nodeSequence", hasSize(3)))
                .andExpect(jsonPath("$.pathResult.nodeSequence[0]").value(1))
                .andExpect(jsonPath("$.pathResult.nodeSequence[1]").value(2))
                .andExpect(jsonPath("$.pathResult.nodeSequence[2]").value(3));
    }

    @Test
    public void testCompareRoute() throws Exception {
        RouteRequest request = new RouteRequest(1L, 3L);

        mockMvc.perform(post("/api/v1/routes/compare")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dijkstra.algorithm").value("dijkstra"))
                .andExpect(jsonPath("$.astar.algorithm").value("astar"))
                .andExpect(jsonPath("$.samePath").value(true));
    }

    @Test
    public void testListNodes() throws Exception {
        mockMvc.perform(get("/api/v1/routes/nodes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void testListNeighbors() throws Exception {
        mockMvc.perform(get("/api/v1/routes/nodes/1/neighbors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))) 
                .andExpect(jsonPath("$[0].nodeId").exists()); 
    }

    @Test
    public void testInvalidNode() throws Exception {
        RouteRequest request = new RouteRequest(999L, 3L);

        mockMvc.perform(post("/api/v1/routes/dijkstra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}
