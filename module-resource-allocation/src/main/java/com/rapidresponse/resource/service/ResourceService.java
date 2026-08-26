package com.rapidresponse.resource.service;

import com.rapidresponse.resource.dto.request.AllocationRequest;
import com.rapidresponse.resource.dto.request.HelicopterRequest;
import com.rapidresponse.resource.dto.request.ReliefItemRequest;
import com.rapidresponse.resource.dto.response.*;
import com.rapidresponse.resource.entity.HelicopterEntity;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.mapper.ReliefItemMapper;
import com.rapidresponse.resource.model.ReliefItem;
import com.rapidresponse.resource.repository.HelicopterRepository;
import com.rapidresponse.resource.repository.ReliefItemRepository;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;
import com.rapidresponse.shared.algorithm.SubsetResult;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ResourceService {

    private final ReliefItemRepository reliefItemRepository;
    private final HelicopterRepository helicopterRepository;
    private final ReliefItemMapper reliefItemMapper;
    private final BranchAndBoundSolver<ReliefItem> branchAndBoundSolver;
    private final GreedySubsetSolver<ReliefItem> greedySolver;

    public ResourceService(ReliefItemRepository reliefItemRepository,
                           HelicopterRepository helicopterRepository,
                           ReliefItemMapper reliefItemMapper,
                           BranchAndBoundSolver<ReliefItem> branchAndBoundSolver,
                           GreedySubsetSolver<ReliefItem> greedySolver) {
        this.reliefItemRepository = reliefItemRepository;
        this.helicopterRepository = helicopterRepository;
        this.reliefItemMapper = reliefItemMapper;
        this.branchAndBoundSolver = branchAndBoundSolver;
        this.greedySolver = greedySolver;
    }

    public AllocationResultResponse allocateExact(AllocationRequest request) {
        HelicopterEntity helicopter = loadHelicopter(request.helicopterId());
        List<ReliefItem> items = loadItems(request.itemIds());

        SubsetResult<ReliefItem> result = branchAndBoundSolver.solve(items, helicopter.getMaxPayloadKg());
        return toResultResponse(result, "branch_and_bound", helicopter.getMaxPayloadKg());
    }

    public AllocationResultResponse allocateHeuristic(AllocationRequest request) {
        HelicopterEntity helicopter = loadHelicopter(request.helicopterId());
        List<ReliefItem> items = loadItems(request.itemIds());

        SubsetResult<ReliefItem> result = greedySolver.solve(items, helicopter.getMaxPayloadKg());
        return toResultResponse(result, "greedy", helicopter.getMaxPayloadKg());
    }

    public AllocationCompareResponse compareAllocations(AllocationRequest request) {
        HelicopterEntity helicopter = loadHelicopter(request.helicopterId());
        List<ReliefItem> items = loadItems(request.itemIds());

        SubsetResult<ReliefItem> exactResult = branchAndBoundSolver.solve(items, helicopter.getMaxPayloadKg());
        SubsetResult<ReliefItem> heuristicResult = greedySolver.solve(items, helicopter.getMaxPayloadKg());

        AllocationResultResponse exact = toResultResponse(exactResult, "branch_and_bound", helicopter.getMaxPayloadKg());
        AllocationResultResponse heuristic = toResultResponse(heuristicResult, "greedy", helicopter.getMaxPayloadKg());

        double heuristicRatio = exact.totalValue() == 0.0
                ? 1.0
                : heuristic.totalValue() / exact.totalValue();

        return new AllocationCompareResponse(exact, heuristic, heuristicRatio);
    }

    public List<ReliefItemResponse> listItems() {
        return reliefItemRepository.findAll().stream()
                .map(this::toItemResponse)
                .toList();
    }

    public ReliefItemResponse addItem(ReliefItemRequest request) {
        ReliefItemEntity entity = ReliefItemEntity.builder()
                .name(request.name())
                .weightKg(request.weightKg())
                .priorityValue(request.priorityValue())
                .category(request.category())
                .build();

        ReliefItemEntity saved = reliefItemRepository.save(entity);
        return toItemResponse(saved);
    }

    public List<HelicopterResponse> listHelicopters() {
        return helicopterRepository.findAll().stream()
                .map(this::toHelicopterResponse)
                .toList();
    }
    //helicopter
    private HelicopterEntity loadHelicopter(Long helicopterId) {
        HelicopterEntity helicopter = helicopterRepository.findById(helicopterId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Helicopter not found with id: " + helicopterId));

        if (helicopter.getMaxPayloadKg() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Helicopter payload capacity must be greater than 0");
        }
        return helicopter;
    }

    private List<ReliefItem> loadItems(List<Long> itemIds) {
        List<ReliefItemEntity> entities;

        if (itemIds == null || itemIds.isEmpty()) {
            entities = reliefItemRepository.findAll();
        } else {
            entities = reliefItemRepository.findAllById(itemIds);
            if (entities.size() != itemIds.size()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "One or more relief item ids were not found");
            }
        }

        return reliefItemMapper.toDomainList(entities);
    }

    private AllocationResultResponse toResultResponse(SubsetResult<ReliefItem> result, String algorithm, double payloadCapacityKg) {
        List<ReliefItemResponse> selected = result.getSelectedItems().stream()
                .map(item -> new ReliefItemResponse(
                        item.getId(), item.getName(), item.getWeightKg(), item.getPriorityValue(), null))
                .toList();

        return new AllocationResultResponse(
                algorithm,
                selected,
                result.getTotalValue(),
                result.getTotalWeight(),
                payloadCapacityKg,
                result.getExecutionTimeNanos()
        );
    }

    private ReliefItemResponse toItemResponse(ReliefItemEntity entity) {
        return new ReliefItemResponse(
                entity.getId(), entity.getName(), entity.getWeightKg(),
                entity.getPriorityValue(), entity.getCategory());
    }

    private HelicopterResponse toHelicopterResponse(HelicopterEntity entity) {
        return new HelicopterResponse(
                entity.getId(), entity.getCallSign(), entity.getMaxPayloadKg(), entity.getStatus());
    }
    public HelicopterResponse addHelicopter(HelicopterRequest request) {
        HelicopterEntity entity = HelicopterEntity.builder()
                .callSign(request.callSign())
                .maxPayloadKg(request.maxPayloadKg())
                .status(request.status())
                .build();

        HelicopterEntity saved = helicopterRepository.save(entity);
        return toHelicopterResponse(saved);
    }
}
