package com.rapidresponse.app.integration;

import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.request.HelicopterRequest;
import com.rapidresponse.resource.dto.request.ReliefItemRequest;
import com.rapidresponse.resource.entity.ReliefCategory;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ResourceApiControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Module 2: POST /api/v1/resources/allocate/exact - Branch & Bound optimal knapsack packing")
    void testAllocateExact_Success() throws Exception {
        List<Long> itemIds = testItems.stream().map(ReliefItemEntity::getId).toList();
        AllocationRequest request = new AllocationRequest(testHelicopter.getId(), itemIds);

        mockMvc.perform(post("/api/v1/resources/allocate/exact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("branch_and_bound")))
                .andExpect(jsonPath("$.totalWeight", lessThanOrEqualTo(500.0)))
                .andExpect(jsonPath("$.totalValue", greaterThan(0.0)))
                .andExpect(jsonPath("$.selectedItems", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Module 2: POST /api/v1/resources/allocate/heuristic - Greedy heuristic knapsack packing")
    void testAllocateHeuristic_Success() throws Exception {
        List<Long> itemIds = testItems.stream().map(ReliefItemEntity::getId).toList();
        AllocationRequest request = new AllocationRequest(testHelicopter.getId(), itemIds);

        mockMvc.perform(post("/api/v1/resources/allocate/heuristic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithm", is("greedy")))
                .andExpect(jsonPath("$.totalWeight", lessThanOrEqualTo(500.0)))
                .andExpect(jsonPath("$.totalValue", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Module 2: POST /api/v1/resources/allocate/compare - Side-by-side exact vs greedy packing")
    void testAllocateCompare_Success() throws Exception {
        List<Long> itemIds = testItems.stream().map(ReliefItemEntity::getId).toList();
        AllocationRequest request = new AllocationRequest(testHelicopter.getId(), itemIds);

        mockMvc.perform(post("/api/v1/resources/allocate/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exact").exists())
                .andExpect(jsonPath("$.heuristic").exists())
                .andExpect(jsonPath("$.heuristicRatio", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Module 2: GET /api/v1/resources/items - Lists all relief items")
    void testListItems_Success() throws Exception {
        mockMvc.perform(get("/api/v1/resources/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    @DisplayName("Module 2: POST /api/v1/resources/items - Creates new relief item (201 Created)")
    void testAddItem_Created_201() throws Exception {
        ReliefItemRequest itemReq = new ReliefItemRequest("Portable Generator", 65.0, 75.0, ReliefCategory.SHELTER);

        mockMvc.perform(post("/api/v1/resources/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Portable Generator")))
                .andExpect(jsonPath("$.weightKg", is(65.0)));
    }

    @Test
    @DisplayName("Module 2: GET /api/v1/resources/helicopters - Lists all helicopters")
    void testListHelicopters_Success() throws Exception {
        mockMvc.perform(get("/api/v1/resources/helicopters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].callSign", is("Air Ambulance Alpha")));
    }

    @Test
    @DisplayName("Module 2: POST /api/v1/resources/helicopters - Creates new helicopter (201 Created)")
    void testAddHelicopter_Created_201() throws Exception {
        HelicopterRequest heliReq = new HelicopterRequest("Rescue Bravo", 800.0, "AVAILABLE");

        mockMvc.perform(post("/api/v1/resources/helicopters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(heliReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.callSign", is("Rescue Bravo")))
                .andExpect(jsonPath("$.maxPayloadKg", is(800.0)));
    }
}
