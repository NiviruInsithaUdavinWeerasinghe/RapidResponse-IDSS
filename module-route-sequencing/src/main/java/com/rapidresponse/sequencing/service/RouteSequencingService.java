package com.rapidresponse.sequencing.service;

import com.rapidresponse.sequencing.algorithm.HeldKarpTSP;
import com.rapidresponse.sequencing.algorithm.TourResult;
import com.rapidresponse.sequencing.algorithm.TwoOptLocalSearch;
import com.rapidresponse.sequencing.dto.ComparisonResponse;
import com.rapidresponse.sequencing.dto.SequencingRequest;
import com.rapidresponse.sequencing.dto.SequencingResponse;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.GraphBuilder;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteSequencingService {

    private final DistanceMatrixBuilder distanceMatrixBuilder;
    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    
    private final HeldKarpTSP exactSolver = new HeldKarpTSP();
    private final TwoOptLocalSearch heuristicSolver = new TwoOptLocalSearch();

    public RouteSequencingService(
            DistanceMatrixBuilder distanceMatrixBuilder,
            NodeRepository nodeRepository,
            EdgeRepository edgeRepository) {
        this.distanceMatrixBuilder = distanceMatrixBuilder;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    public SequencingResponse calculateExactTour(SequencingRequest request) {
        Graph graph = loadGraph();
        validateRequest(graph, request);
        
        List<Long> combinedNodes = prepareCombinedNodes(request);
        double[][] distanceMatrix = distanceMatrixBuilder.buildMatrix(graph, combinedNodes);
        
        TourResult result = exactSolver.findOptimalTour(distanceMatrix, 0);
        return mapToResponse(graph, combinedNodes, result);
    }

    public SequencingResponse calculateHeuristicTour(SequencingRequest request) {
        Graph graph = loadGraph();
        validateRequest(graph, request);
        
        List<Long> combinedNodes = prepareCombinedNodes(request);
        double[][] distanceMatrix = distanceMatrixBuilder.buildMatrix(graph, combinedNodes);
        
        TourResult result = heuristicSolver.findOptimalTour(distanceMatrix, 0);
        return mapToResponse(graph, combinedNodes, result);
    }

    public ComparisonResponse compareSolvers(SequencingRequest request) {
        Graph graph = loadGraph();
        validateRequest(graph, request);
        
        List<Long> combinedNodes = prepareCombinedNodes(request);
        double[][] distanceMatrix = distanceMatrixBuilder.buildMatrix(graph, combinedNodes);
        
        TourResult exactResult = exactSolver.findOptimalTour(distanceMatrix, 0);
        TourResult heuristicResult = heuristicSolver.findOptimalTour(distanceMatrix, 0);
        
        SequencingResponse exactResponse = mapToResponse(graph, combinedNodes, exactResult);
        SequencingResponse heuristicResponse = mapToResponse(graph, combinedNodes, heuristicResult);
        
        double exactDist = exactResult.getTotalDistance();
        double heuristicDist = heuristicResult.getTotalDistance();
        
        double gap = exactDist == 0.0 ? 0.0 : ((heuristicDist - exactDist) / exactDist) * 100.0;
        String optimalityGap = String.format("%.2f%%", gap);
        
        return new ComparisonResponse(exactResponse, heuristicResponse, optimalityGap);
    }

    public double[][] getDistanceMatrix(List<Long> stopNodeIds) {
        if (stopNodeIds == null || stopNodeIds.isEmpty()) {
            throw new IllegalArgumentException("Stops list must not be null or empty");
        }
        Graph graph = loadGraph();
        
        // Validate all stops exist in database/graph
        for (Long stopId : stopNodeIds) {
            if (stopId == null) {
                throw new IllegalArgumentException("stopNodeIds must not contain null elements");
            }
            if (graph.getNode(stopId) == null) {
                throw new IllegalArgumentException("Node ID " + stopId + " does not exist in graph.");
            }
        }
        
        return distanceMatrixBuilder.buildMatrix(graph, stopNodeIds);
    }

    private Graph loadGraph() {
        List<NodeEntity> nodes = nodeRepository.findAll();
        List<EdgeEntity> edges = edgeRepository.findAll();
        return GraphBuilder.build(nodes, edges);
    }

    private void validateRequest(Graph graph, SequencingRequest request) {
        if (request == null) {
            throw new NullPointerException("Request must not be null");
        }
        if (request.depotNodeId() == null) {
            throw new IllegalArgumentException("Depot node ID must not be null");
        }
        if (graph.getNode(request.depotNodeId()) == null) {
            throw new IllegalArgumentException("Depot node not found in graph");
        }
        if (request.stopNodeIds() == null || request.stopNodeIds().size() < 2 || request.stopNodeIds().size() > 20) {
            throw new IllegalArgumentException("stopNodeIds must contain between 2 and 20 elements");
        }
        for (Long stopId : request.stopNodeIds()) {
            if (stopId == null) {
                throw new IllegalArgumentException("stopNodeIds must not contain null elements");
            }
            if (graph.getNode(stopId) == null) {
                throw new IllegalArgumentException("Stop node " + stopId + " not found in graph");
            }
        }
    }

    private List<Long> prepareCombinedNodes(SequencingRequest request) {
        List<Long> combined = new ArrayList<>();
        combined.add(request.depotNodeId());
        combined.addAll(request.stopNodeIds());
        return combined;
    }

    private SequencingResponse mapToResponse(Graph graph, List<Long> combinedNodes, TourResult tourResult) {
        List<Long> tourNodeIds = new ArrayList<>();
        List<String> tourNodeNames = new ArrayList<>();
        
        for (int idx : tourResult.getTourSequence()) {
            Long id = combinedNodes.get(idx);
            tourNodeIds.add(id);
            tourNodeNames.add(graph.getNode(id).getName());
        }
        
        return new SequencingResponse(
            tourNodeIds,
            tourNodeNames,
            tourResult.getTotalDistance(),
            tourResult.getProblemSize(),
            tourResult.getExecutionTimeNanos()
        );
    }
}
