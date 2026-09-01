package com.rapidresponse.app.integration;

import com.rapidresponse.sequencing.dto.SequencingRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RouteSequencingApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Module 5: POST /api/v1/sequencing/optimize/exact - Held-Karp exact TSP delivery tour")
    void testOptimizeExact_Success() throws Exception {
        SequencingRequest request = new SequencingRequest(1L, List.of(2L, 3L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/exact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tourNodeIds", hasSize(4))) // depot + 2 stops + return = 4
                .andExpect(jsonPath("$.totalDistance", greaterThan(0.0)))
                .andExpect(jsonPath("$.problemSize", is(3)));
    }

    @Test
    @DisplayName("Module 5: POST /api/v1/sequencing/optimize/heuristic - 2-Opt local search TSP delivery tour")
    void testOptimizeHeuristic_Success() throws Exception {
        SequencingRequest request = new SequencingRequest(1L, List.of(2L, 3L, 4L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/heuristic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tourNodeIds", hasSize(5)))
                .andExpect(jsonPath("$.totalDistance", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Module 5: POST /api/v1/sequencing/optimize/compare - Side-by-side TSP solver comparison")
    void testCompare_Success() throws Exception {
        SequencingRequest request = new SequencingRequest(1L, List.of(2L, 3L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exact").exists())
                .andExpect(jsonPath("$.heuristic").exists())
                .andExpect(jsonPath("$.optimalityGap").isString());
    }

    @Test
    @DisplayName("Module 5: POST /api/v1/sequencing/distance-matrix - Builds pairwise road distance matrix")
    void testDistanceMatrix_Success() throws Exception {
        List<Long> stopNodeIds = List.of(1L, 2L, 3L);

        mockMvc.perform(post("/api/v1/sequencing/distance-matrix")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(stopNodeIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0]", hasSize(3)));
    }

    @Test
    @DisplayName("Module 5: POST /api/v1/sequencing/optimize/exact - Returns 400 when stop list is too small")
    void testOptimizeExact_ValidationError_400() throws Exception {
        SequencingRequest request = new SequencingRequest(1L, List.of(2L)); // min size is 2

        mockMvc.perform(post("/api/v1/sequencing/optimize/exact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
