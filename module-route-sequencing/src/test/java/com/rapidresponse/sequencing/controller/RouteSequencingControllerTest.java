package com.rapidresponse.sequencing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rapidresponse.sequencing.dto.ComparisonResponse;
import com.rapidresponse.sequencing.dto.SequencingRequest;
import com.rapidresponse.sequencing.dto.SequencingResponse;
import com.rapidresponse.sequencing.service.RouteSequencingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RouteSequencingController.class)
@ContextConfiguration(classes = {RouteSequencingController.class})
@WithMockUser // Bypass spring security
class RouteSequencingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RouteSequencingService sequencingService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testOptimizeExact_Success() throws Exception {
        SequencingResponse mockResponse = new SequencingResponse(
                Arrays.asList(0L, 1L, 2L, 0L),
                Arrays.asList("Depot", "Camp A", "Camp B", "Depot"),
                4.5,
                3,
                1000L
        );
        when(sequencingService.calculateExactTour(any(SequencingRequest.class))).thenReturn(mockResponse);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/exact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDistance").value(4.5))
                .andExpect(jsonPath("$.problemSize").value(3))
                .andExpect(jsonPath("$.tourNodeIds[0]").value(0))
                .andExpect(jsonPath("$.tourNodeIds[3]").value(0));
    }

    @Test
    void testOptimizeHeuristic_Success() throws Exception {
        SequencingResponse mockResponse = new SequencingResponse(
                Arrays.asList(0L, 1L, 2L, 0L),
                Arrays.asList("Depot", "Camp A", "Camp B", "Depot"),
                4.5,
                3,
                1000L
        );
        when(sequencingService.calculateHeuristicTour(any(SequencingRequest.class))).thenReturn(mockResponse);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/heuristic")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDistance").value(4.5))
                .andExpect(jsonPath("$.problemSize").value(3));
    }

    @Test
    void testCompare_Success() throws Exception {
        SequencingResponse mockExact = new SequencingResponse(
                Arrays.asList(0L, 1L, 2L, 0L),
                Arrays.asList("Depot", "Camp A", "Camp B", "Depot"),
                4.5,
                3,
                1000L
        );
        SequencingResponse mockHeuristic = new SequencingResponse(
                Arrays.asList(0L, 2L, 1L, 0L),
                Arrays.asList("Depot", "Camp B", "Camp A", "Depot"),
                4.5,
                3,
                800L
        );
        ComparisonResponse comparisonResponse = new ComparisonResponse(mockExact, mockHeuristic, "0.00%");
        when(sequencingService.compareSolvers(any(SequencingRequest.class))).thenReturn(comparisonResponse);

        SequencingRequest request = new SequencingRequest(0L, Arrays.asList(1L, 2L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/compare")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.optimalityGap").value("0.00%"))
                .andExpect(jsonPath("$.exact.totalDistance").value(4.5))
                .andExpect(jsonPath("$.heuristic.totalDistance").value(4.5));
    }

    @Test
    void testRequestValidation_InvalidSize() throws Exception {
        // Validation fails if stopNodeIds contains less than 2 elements
        SequencingRequest request = new SequencingRequest(0L, List.of(1L));

        mockMvc.perform(post("/api/v1/sequencing/optimize/exact")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDistanceMatrix_Success() throws Exception {
        double[][] matrix = {
            {0.0, 1.0},
            {1.0, 0.0}
        };
        when(sequencingService.getDistanceMatrix(any())).thenReturn(matrix);

        mockMvc.perform(post("/api/v1/sequencing/distance-matrix")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Arrays.asList(0L, 1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0][0]").value(0.0))
                .andExpect(jsonPath("$[0][1]").value(1.0));
    }
}
