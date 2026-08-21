package com.rapidresponse.route.model;

import java.util.List;

import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.Graph;
import com.rapidresponse.shared.model.Node;

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

            // Skip blocked roads
            if (entity.isBlocked()) {
                continue;
            }

            // Two-way road
            if (!entity.isOneWay()) {

                graph.addUndirectedEdge(
                        entity.getSourceId(),
                        entity.getTargetId(),
                        entity.getDistanceKm(),
                        entity.getTravelTimeMins()
                );

            } else {

                // One-way road
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
