package com.rapidresponse.route.model;

import java.util.List;

import org.springframework.stereotype.Component;

import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.Graph;

/**
 * Spring component that constructs an in-memory {@link Graph} from JPA node and edge records.
 */
@Component
public class GraphBuilder {

    /**
     * Builds a Graph from lists of JPA node and edge entities.
     *
     * @param nodeEntities the persisted node records
     * @param edgeEntities the persisted edge records
     * @return a fully constructed Graph
     * @throws IllegalArgumentException if self-loops or missing node references are found
     */
    public Graph build(List<NodeEntity> nodeEntities, List<EdgeEntity> edgeEntities) {
        return com.rapidresponse.shared.model.GraphBuilder.build(nodeEntities, edgeEntities);
    }
}
