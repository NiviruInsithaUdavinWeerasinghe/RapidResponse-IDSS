package com.rapidresponse.app.integration;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.dto.request.DecisionRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DecisionApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Module 4: POST /api/v1/decisions/optimize/exact - Branch & Bound optimal SOS selection")
    void testOptimizeExact_Success() throws Exception {
        DecisionRequest request = new DecisionRequest(5.0, 0.5, 0.3, 0.2, null, null);

        mockMvc.perform(post("/api/v1/decisions/optimize/exact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("branch_and_bound")))
                .andExpect(jsonPath("$.totalCapacityUsed", lessThanOrEqualTo(5.0)))
                .andExpect(jsonPath("$.selectedRequests", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Module 4: POST /api/v1/decisions/optimize/heuristic - Weighted Scoring heuristic selection")
    void testOptimizeHeuristic_Success() throws Exception {
        DecisionRequest request = new DecisionRequest(5.0, 0.5, 0.3, 0.2, null, null);

        mockMvc.perform(post("/api/v1/decisions/optimize/heuristic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("weighted_scoring")))
                .andExpect(jsonPath("$.totalCapacityUsed", lessThanOrEqualTo(5.0)));
    }

    @Test
    @DisplayName("Module 4: POST /api/v1/decisions/optimize/compare - Side-by-side solver comparison")
    void testOptimizeCompare_Success() throws Exception {
        DecisionRequest request = new DecisionRequest(5.0, 0.5, 0.3, 0.2, null, null);

        mockMvc.perform(post("/api/v1/decisions/optimize/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exact").exists())
                .andExpect(jsonPath("$.heuristic").exists())
                .andExpect(jsonPath("$.heuristicRatio", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Module 4: GET /api/v1/decisions/sos-requests - Lists pending emergency SOS requests")
    void testListPendingRequests_Success() throws Exception {
        mockMvc.perform(get("/api/v1/decisions/sos-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Module 4: POST /api/v1/decisions/sos-requests - Submits a new SOS request (201 Created)")
    void testSubmitRequest_Created_201() throws Exception {
        CreateSOSRequest createReq = new CreateSOSRequest(null, 4L, "Charlie Hill Station", 8.0, 600, 70.0, 2.5);

        mockMvc.perform(post("/api/v1/decisions/sos-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.campName", is("Charlie Hill Station")))
                .andExpect(jsonPath("$.injurySeverity", is(8.0)));
    }

    @Test
    @DisplayName("Module 4: POST /api/v1/decisions/sample-data - Seeds sample test SOS requests")
    void testSeedSampleData_Success() throws Exception {
        mockMvc.perform(post("/api/v1/decisions/sample-data")
                        .param("count", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)));
    }
}
