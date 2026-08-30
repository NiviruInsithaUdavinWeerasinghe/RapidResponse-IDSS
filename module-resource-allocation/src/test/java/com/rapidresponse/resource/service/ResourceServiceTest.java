package com.rapidresponse.resource.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.request.HelicopterRequest;
import com.rapidresponse.resource.dto.request.ReliefItemRequest;
import com.rapidresponse.resource.dto.response.AllocationCompareResponse;
import com.rapidresponse.resource.dto.response.AllocationResultResponse;
import com.rapidresponse.resource.dto.response.HelicopterResponse;
import com.rapidresponse.resource.dto.response.ReliefItemResponse;
import com.rapidresponse.resource.entity.HelicopterEntity;
import com.rapidresponse.resource.entity.ReliefCategory;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.mapper.ReliefItemMapper;
import com.rapidresponse.resource.model.ReliefItem;
import com.rapidresponse.resource.repository.HelicopterRepository;
import com.rapidresponse.resource.repository.ReliefItemRepository;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ReliefItemRepository reliefItemRepository;

    @Mock
    private HelicopterRepository helicopterRepository;

    @Mock
    private ReliefItemMapper reliefItemMapper;

    private BranchAndBoundSolver<ReliefItem> branchAndBoundSolver;
    private GreedySubsetSolver<ReliefItem> greedySolver;
    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        branchAndBoundSolver = new BranchAndBoundSolver<>();
        greedySolver = new GreedySubsetSolver<>();
        resourceService = new ResourceService(
                reliefItemRepository, helicopterRepository, reliefItemMapper,
                branchAndBoundSolver, greedySolver);
    }

    private List<ReliefItemEntity> classicKnapsackEntities() {
        return Arrays.asList(
                entity(1L, "Item 1", 5.0, 10.0),
                entity(2L, "Item 2", 4.0, 40.0),
                entity(3L, "Item 3", 6.0, 30.0),
                entity(4L, "Item 4", 3.0, 50.0)
        );
    }

    private ReliefItemEntity entity(Long id, String name, double weightKg, double priorityValue) {
        return ReliefItemEntity.builder()
                .id(id)
                .name(name)
                .weightKg(weightKg)
                .priorityValue(priorityValue)
                .category(ReliefCategory.MEDICAL)
                .build();
    }

    private List<ReliefItem> toDomain(List<ReliefItemEntity> entities) {
        List<ReliefItem> items = new ArrayList<>();
        for (ReliefItemEntity e : entities) {
            items.add(new ReliefItem(e.getId(), e.getName(), e.getWeightKg(), e.getPriorityValue()));
        }
        return items;
    }

    private HelicopterEntity helicopter(Long id, double maxPayloadKg) {
        return HelicopterEntity.builder()
                .id(id)
                .callSign("Rescue-" + id)
                .maxPayloadKg(maxPayloadKg)
                .status("AVAILABLE")
                .build();
    }

    @Test
    @DisplayName("Test 1 allocateExact should find the optimal subset via Branch & Bound")
    void allocateExact_classicKnapsack_shouldFindOptimalSubset() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 10.0)));
        when(reliefItemRepository.findAllById(anyList())).thenReturn(entities);
        when(reliefItemMapper.toDomainList(entities)).thenReturn(toDomain(entities));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 2L, 3L, 4L));
        AllocationResultResponse result = resourceService.allocateExact(request);

        assertEquals("branch_and_bound", result.algorithm());
        assertEquals(90.0, result.totalValue(), 1e-6);
        assertEquals(7.0, result.totalWeight(), 1e-6);
        assertEquals(10.0, result.payloadCapacityKg(), 1e-9);
        assertEquals(2, result.selectedItems().size());
        assertTrue(result.selectedItems().stream().anyMatch(i -> i.id().equals(2L)));
        assertTrue(result.selectedItems().stream().anyMatch(i -> i.id().equals(4L)));
    }

    @Test
    @DisplayName("Test 2 allocateExact should never exceed the helicopter's payload capacity")
    void allocateExact_shouldRespectPayloadCapacity() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 6.0)));
        when(reliefItemRepository.findAllById(anyList())).thenReturn(entities);
        when(reliefItemMapper.toDomainList(entities)).thenReturn(toDomain(entities));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 2L, 3L, 4L));
        AllocationResultResponse result = resourceService.allocateExact(request);

        assertTrue(result.totalWeight() <= 6.0 + 1e-9);
    }

    @Test
    @DisplayName("Test 3 allocateExact with no items requested should load full inventory")
    void allocateExact_nullItemIds_shouldLoadFullInventory() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 10.0)));
        when(reliefItemRepository.findAll()).thenReturn(entities);
        when(reliefItemMapper.toDomainList(entities)).thenReturn(toDomain(entities));

        AllocationRequest request = new AllocationRequest(1L, null);
        AllocationResultResponse result = resourceService.allocateExact(request);

        assertEquals(90.0, result.totalValue(), 1e-6);
    }

    @Test
    @DisplayName("Test 4 allocateHeuristic should respect capacity and reach at least 50% of the optimal value")
    void allocateHeuristic_shouldRespectCapacityAndMeetApproximationGuarantee() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 10.0)));
        when(reliefItemRepository.findAllById(anyList())).thenReturn(entities);
        when(reliefItemMapper.toDomainList(entities)).thenReturn(toDomain(entities));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 2L, 3L, 4L));
        AllocationResultResponse exact = resourceService.allocateExact(request);
        AllocationResultResponse heuristic = resourceService.allocateHeuristic(request);

        assertEquals("greedy", heuristic.algorithm());
        assertTrue(heuristic.totalWeight() <= 10.0 + 1e-9, "heuristic packing must respect payload capacity");
        assertTrue(heuristic.totalValue() >= 0.5 * exact.totalValue() - 1e-6,
                "greedy heuristic must guarantee >= 50% of the optimal value");
        assertTrue(heuristic.totalValue() <= exact.totalValue() + 1e-6,
                "heuristic cannot exceed the exact optimal value");
    }

    @Test
    @DisplayName("Test 5 compareAllocations should return a consistent heuristic-to-exact ratio")
    void compareAllocations_shouldComputeConsistentRatio() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 10.0)));
        when(reliefItemRepository.findAllById(anyList())).thenReturn(entities);
        when(reliefItemMapper.toDomainList(entities)).thenReturn(toDomain(entities));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 2L, 3L, 4L));
        AllocationCompareResponse comparison = resourceService.compareAllocations(request);

        assertNotNull(comparison.exact());
        assertNotNull(comparison.heuristic());
        assertTrue(comparison.heuristicRatio() > 0.0 && comparison.heuristicRatio() <= 1.0 + 1e-6);
        assertEquals(comparison.heuristic().totalValue() / comparison.exact().totalValue(),
                comparison.heuristicRatio(), 1e-9);
    }


    @Test
    @DisplayName("Test 6 allocateExact with unknown helicopter id should throw 404")
    void allocateExact_unknownHelicopter_shouldThrowNotFound() {
        when(helicopterRepository.findById(99L)).thenReturn(Optional.empty());

        AllocationRequest request = new AllocationRequest(99L, Arrays.asList(1L, 2L));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> resourceService.allocateExact(request));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Test 7 allocateExact with zero payload capacity should throw 400")
    void allocateExact_zeroPayloadCapacity_shouldThrowBadRequest() {
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 0.0)));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 2L));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> resourceService.allocateExact(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Test 8 requesting unknown item ids should throw 404")
    void allocateExact_unknownItemIds_shouldThrowNotFound() {
        when(helicopterRepository.findById(1L)).thenReturn(Optional.of(helicopter(1L, 10.0)));
        // Only one of the two requested ids exists.
        when(reliefItemRepository.findAllById(anyList()))
                .thenReturn(List.of(entity(1L, "Item 1", 5.0, 10.0)));

        AllocationRequest request = new AllocationRequest(1L, Arrays.asList(1L, 999L));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> resourceService.allocateExact(request));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Test 9 listItems should map all persisted relief items")
    void listItems_shouldReturnMappedInventory() {
        List<ReliefItemEntity> entities = classicKnapsackEntities();
        when(reliefItemRepository.findAll()).thenReturn(entities);

        List<ReliefItemResponse> items = resourceService.listItems();

        assertEquals(4, items.size());
        assertEquals("Item 1", items.get(0).name());
    }

    @Test
    @DisplayName("Test 10 addItem should persist and return the created relief item")
    void addItem_shouldPersistAndReturnResponse() {
        ReliefItemRequest request = new ReliefItemRequest("Water Purifier", 8.0, 60.0, ReliefCategory.WATER);
        ReliefItemEntity saved = entity(10L, "Water Purifier", 8.0, 60.0);
        when(reliefItemRepository.save(any(ReliefItemEntity.class))).thenReturn(saved);

        ReliefItemResponse response = resourceService.addItem(request);

        assertEquals(10L, response.id());
        assertEquals("Water Purifier", response.name());
        assertEquals(8.0, response.weightKg(), 1e-9);
    }

    @Test
    @DisplayName("Test 11 listHelicopters should map all persisted helicopters")
    void listHelicopters_shouldReturnMappedFleet() {
        when(helicopterRepository.findAll()).thenReturn(List.of(helicopter(1L, 1000.0), helicopter(2L, 800.0)));

        List<HelicopterResponse> helicopters = resourceService.listHelicopters();

        assertEquals(2, helicopters.size());
        assertEquals("Rescue-1", helicopters.get(0).callSign());
    }

    @Test
    @DisplayName("Test 12 addHelicopter should persist and return the created helicopter")
    void addHelicopter_shouldPersistAndReturnResponse() {
        HelicopterRequest request = new HelicopterRequest("Rescue-5", 1200.0, "AVAILABLE");
        HelicopterEntity saved = helicopter(5L, 1200.0);
        when(helicopterRepository.save(any(HelicopterEntity.class))).thenReturn(saved);

        HelicopterResponse response = resourceService.addHelicopter(request);

        assertEquals(5L, response.id());
        assertEquals("Rescue-5", response.callSign());
        assertEquals(1200.0, response.maxPayloadKg(), 1e-9);
    }
}