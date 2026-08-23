package com.rapidresponse.allocation.service;

import com.rapidresponse.allocation.dto.request.AllocationRequest;
import com.rapidresponse.allocation.dto.response.AllocationResponse;
import com.rapidresponse.allocation.entity.ResourceEntity;
import com.rapidresponse.allocation.repository.ResourceRepository;
import com.rapidresponse.allocation.solver.ResourceSelectable;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;
import com.rapidresponse.shared.algorithm.SubsetResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private static final String ALGO_GREEDY = "greedy";
    private static final String ALGO_BRANCH_AND_BOUND = "branch_and_bound";

    private final ResourceRepository resourceRepository;
    private final BranchAndBoundSolver<ResourceSelectable> branchAndBoundSolver;
    private final GreedySubsetSolver<ResourceSelectable> greedySolver;

    public AllocationResponse allocate(AllocationRequest request) {
        List<ResourceEntity> resources = resourceRepository.findAll();

        List<ResourceSelectable> selectables = resources.stream()
                .map(ResourceSelectable::new)
                .toList();

        String algorithm = normalizeAlgorithm(request.algorithm());

        SubsetResult<ResourceSelectable> result = ALGO_GREEDY.equals(algorithm)
                ? greedySolver.solve(selectables, request.capacity())
                : branchAndBoundSolver.solve(selectables, request.capacity());

        List<String> names = result.getSelectedItems().stream()
                .map(ResourceSelectable::getLabel)
                .toList();

        return new AllocationResponse(
                names,
                result.getTotalValue(),
                result.getTotalWeight(),
                result.getCapacityUsed(),
                algorithm,
                result.getNodesExplored(),
                result.getNodesPruned(),
                result.getExecutionTimeNanos()
        );
    }

    /**
     * Runs both algorithms against the current resource pool and capacity,
     * for side-by-side comparison in the coursework's performance evaluation.
     */
    public List<AllocationResponse> compareAlgorithms(double capacity) {
        List<ResourceEntity> resources = resourceRepository.findAll();
        List<ResourceSelectable> selectables = resources.stream()
                .map(ResourceSelectable::new)
                .toList();

        SubsetResult<ResourceSelectable> exact = branchAndBoundSolver.solve(selectables, capacity);
        SubsetResult<ResourceSelectable> greedy = greedySolver.solve(selectables, capacity);

        return List.of(
                toResponse(exact, ALGO_BRANCH_AND_BOUND),
                toResponse(greedy, ALGO_GREEDY)
        );
    }

    private AllocationResponse toResponse(SubsetResult<ResourceSelectable> result, String algorithmUsed) {
        List<String> names = result.getSelectedItems().stream()
                .map(ResourceSelectable::getLabel)
                .toList();

        return new AllocationResponse(
                names,
                result.getTotalValue(),
                result.getTotalWeight(),
                result.getCapacityUsed(),
                algorithmUsed,
                result.getNodesExplored(),
                result.getNodesPruned(),
                result.getExecutionTimeNanos()
        );
    }

    private String normalizeAlgorithm(String algorithm) {
        if (algorithm == null || algorithm.isBlank()) {
            return ALGO_BRANCH_AND_BOUND;
        }
        return algorithm.equalsIgnoreCase(ALGO_GREEDY) ? ALGO_GREEDY : ALGO_BRANCH_AND_BOUND;
    }
}
