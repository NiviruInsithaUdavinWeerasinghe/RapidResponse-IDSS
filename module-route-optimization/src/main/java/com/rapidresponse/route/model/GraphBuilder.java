package com.rapidresponse.route.model;

import java.util.List;

import com.rapidresponse.route.entity.EdgeEntity;
import com.rapidresponse.route.entity.NodeEntity;

/**
 * Utility class that constructs an in-memory {@link Graph} from database
 * {@link NodeEntity} and {@link EdgeEntity} JPA records.
 */
public class GraphBuilder {

    /**
     * Builds a Graph from lists of JPA node and edge entities.
     *
     * @param nodeEntities the persisted node records
     * @param edgeEntities the persisted edge records
     * @return a fully constructed Graph
     * @throws IllegalArgumentException if self-loops or missing node references are found
     */
    public static Graph build(List<NodeEntity> nodeEntities, List<EdgeEntity> edgeEntities) {
        Graph graph = new Graph();

        // Add all nodes first
        for (NodeEntity entity : nodeEntities) {
            Node node = new Node(
                    entity.getId(),
                    entity.getName(),
                    entity.getLatitude(),
                    entity.getLongitude(),
                    entity.getNodeType()
            );
            graph.addNode(node);
        }

        // Add edges (skipping blocked edges)
        for (EdgeEntity entity : edgeEntities) {
            if (entity.isBlocked()) {
                continue;
            }

            if (entity.isUndirected()) {
                graph.addUndirectedEdge(
                        entity.getSourceId(),
                        entity.getTargetId(),
                        entity.getDistanceKm(),
                        entity.getTravelTimeMins()
                );
            } else {
                graph.addEdge(
                        entity.getSourceId(),
                        entity.getTargetId(),
                        entity.getDistanceKm(),
                        entity.getTravelTimeMins()
                );
            }
        }

        return graph;
    }
}
