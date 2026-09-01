package com.rapidresponse.app.integration;

import com.rapidresponse.app.dto.request.BenchmarkRunRequest;
import com.rapidresponse.app.dto.request.DecideAndPackRequest;
import com.rapidresponse.app.dto.request.DecideAndSequenceRequest;
import com.rapidresponse.app.dto.request.FullResponsePipelineRequest;
import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PipelineApiControllerIntegrationTest extends BaseIntegrationTest {

    private List<CreateSOSRequest> createSampleSOSRequests() {
        return List.of(
                new CreateSOSRequest(null, 2L, "Alpha Sector Camp", 9.0, 800, 90.0, 3.0),
                new CreateSOSRequest(null, 3L, "Bravo Valley Shelter", 7.5, 400, 60.0, 2.0),
                new CreateSOSRequest(null, 4L, "Charlie Hill Station", 8.0, 500, 75.0, 2.0)
        );
    }

    @Test
    @DisplayName("Pipeline: POST /api/v1/pipeline/decide-and-pack - Module 4 ➔ Module 2 Pipeline")
    void testDecideAndPackPipeline_Success() throws Exception {
        List<Long> itemIds = testItems.stream().map(ReliefItemEntity::getId).toList();
        DecideAndPackRequest request = new DecideAndPackRequest(
                5.0, 0.5, 0.3, 0.2, testHelicopter.getId(), itemIds, createSampleSOSRequests(), "EXACT", "EXACT"
        );

        mockMvc.perform(post("/api/v1/pipeline/decide-and-pack")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decisionResult").exists())
                .andExpect(jsonPath("$.allocationResult").exists())
                .andExpect(jsonPath("$.totalApprovedCamps", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.summary", containsString("Pipeline completed successfully")));
    }

    @Test
    @DisplayName("Pipeline: POST /api/v1/pipeline/decide-and-sequence - Module 4 ➔ Module 5 Pipeline")
    void testDecideAndSequencePipeline_Success() throws Exception {
        DecideAndSequenceRequest request = new DecideAndSequenceRequest(
                5.0, 0.5, 0.3, 0.2, 1L, createSampleSOSRequests(), "EXACT", "AUTO"
        );

        mockMvc.perform(post("/api/v1/pipeline/decide-and-sequence")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decisionResult").exists())
                .andExpect(jsonPath("$.tourSequence", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.totalTourDistanceKm", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Pipeline: POST /api/v1/pipeline/full-response - Master 5-Stage End-to-End Pipeline")
    void testFullResponsePipeline_Success() throws Exception {
        List<Long> itemIds = testItems.stream().map(ReliefItemEntity::getId).toList();
        FullResponsePipelineRequest request = new FullResponsePipelineRequest(
                1L, testHelicopter.getId(), 6.0, 0.5, 0.3, 0.2, itemIds, createSampleSOSRequests(), "EXACT", "EXACT", "AUTO"
        );

        mockMvc.perform(post("/api/v1/pipeline/full-response")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.networkReachability").exists())
                .andExpect(jsonPath("$.networkMst").exists())
                .andExpect(jsonPath("$.decisionResult").exists())
                .andExpect(jsonPath("$.resourceAllocation").exists())
                .andExpect(jsonPath("$.deliveryTourSequence", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.stageExecutionTimesNanos").exists());
    }

    @Test
    @DisplayName("Benchmark: GET /api/v1/benchmark/pairs - Lists available benchmark algorithm pairs")
    void testBenchmarkPairs_Success() throws Exception {
        mockMvc.perform(get("/api/v1/benchmark/pairs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    @DisplayName("Benchmark: POST /api/v1/benchmark/run - Runs benchmark scalability sweep")
    void testBenchmarkRun_Success() throws Exception {
        BenchmarkRunRequest request = new BenchmarkRunRequest(
                "ROUTE_DIJKSTRA_VS_ASTAR",
                List.of(10, 20),
                3
        );

        mockMvc.perform(post("/api/v1/benchmark/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exact").exists())
                .andExpect(jsonPath("$.heuristic").exists());
    }
}
