package com.rapidresponse.app.service;

import com.rapidresponse.app.dto.request.FullResponsePipelineRequest;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;
import com.rapidresponse.shared.model.NodeType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Validates request parameters and prepares disaster road network graph topologies for the Full Response Pipeline.
 *
 * <p>Implements Issue #31 validation and topology generation layer.
 */
@Component
public class FullResponsePipelineValidator {

    /**
     * Resolves severity weight with validation and fallback.
     */
    public double resolveSeverityWeight(FullResponsePipelineRequest request) {
        return request != null && request.severityWeight() != null && request.severityWeight() > 0 
                ? request.severityWeight() : 0.5;
    }

    /**
     * Resolves population weight with validation and fallback.
     */
    public double resolvePopulationWeight(FullResponsePipelineRequest request) {
        return request != null && request.populationWeight() != null && request.populationWeight() > 0 
                ? request.populationWeight() : 0.3;
    }

    /**
     * Resolves shortage weight with validation and fallback.
     */
    public double resolveShortageWeight(FullResponsePipelineRequest request) {
        return request != null && request.shortageWeight() != null && request.shortageWeight() > 0 
                ? request.shortageWeight() : 0.2;
    }

    /**
     * Resolves daily truck capacity with validation and fallback.
     */
    public double resolveMaxDailyCapacity(FullResponsePipelineRequest request) {
        return request != null && request.maxDailyCapacity() != null && request.maxDailyCapacity() > 0 
                ? request.maxDailyCapacity() : 15.0;
    }

    /**
     * Resolves HQ depot node ID with validation and fallback.
     */
    public Long resolveHqNodeId(FullResponsePipelineRequest request) {
        return request != null && request.hqNodeId() != null && request.hqNodeId() > 0 
                ? request.hqNodeId() : 1L;
    }

    /**
     * Resolves helicopter identifier with validation and fallback.
     */
    public Long resolveHelicopterId(FullResponsePipelineRequest request) {
        return request != null && request.helicopterId() != null && request.helicopterId() > 0 
                ? request.helicopterId() : 1L;
    }

    /**
     * Constructs a connected road graph topology between HQ and all selected rescue stops.
     *
     * @param hqId HQ depot node ID
     * @param stopNodeIds list of unique stop node IDs
     * @param nodeNames map of node names
     * @param nodeTypes map of node types
     * @return constructed road graph with geographic coordinates and road edge weights
     */
    public Graph buildDisasterRoadNetwork(Long hqId, List<Long> stopNodeIds, Map<Long, String> nodeNames, Map<Long, String> nodeTypes) {
        Graph graph = new Graph();
        graph.addNode(new Node(hqId, "Central HQ Depot", 6.9271, 79.8612, NodeType.HQ));
        nodeNames.put(hqId, "Central HQ Depot");
        nodeTypes.put(hqId, "HQ");

        for (Long nodeId : stopNodeIds) {
            if (!nodeId.equals(hqId) && graph.getNode(nodeId) == null) {
                String name = nodeNames.getOrDefault(nodeId, "Camp #" + nodeId);
                double lat = 6.9271 + ((nodeId * 7) % 50) * 0.01;
                double lon = 79.8612 + ((nodeId * 11) % 50) * 0.01;
                graph.addNode(new Node(nodeId, name, lat, lon, NodeType.RESCUE_CAMP));
                nodeNames.putIfAbsent(nodeId, name);
                nodeTypes.putIfAbsent(nodeId, "RESCUE_CAMP");
            }
        }

        int n = stopNodeIds.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Long u = stopNodeIds.get(i);
                Long v = stopNodeIds.get(j);
                Node nu = graph.getNode(u);
                Node nv = graph.getNode(v);

                if (nu != null && nv != null) {
                    double dLat = (nu.getLatitude() - nv.getLatitude()) * 111.0;
                    double dLon = (nu.getLongitude() - nv.getLongitude()) * 111.0;
                    double distKm = Math.max(1.5, Math.round(Math.sqrt(dLat * dLat + dLon * dLon) * 10.0) / 10.0);
                    double timeMins = Math.round(distKm * 2.2 * 10.0) / 10.0;
                    graph.addUndirectedEdge(u, v, distKm, timeMins);
                }
            }
        }
        return graph;
    }
}
