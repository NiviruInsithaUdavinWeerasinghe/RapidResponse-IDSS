package com.rapidresponse.core;

import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LocalRouteData {

    @Bean
    CommandLineRunner seedRouteData(NodeRepository nodes, EdgeRepository edges) {
        return args -> {
            if (nodes.count() > 0) {
                return;
            }

            nodes.save(new NodeEntity(1L, "HQ", 7.2906, 80.6337, NodeType.HQ));
            nodes.save(new NodeEntity(2L, "North Junction", 7.3356, 80.6214, NodeType.INTERSECTION));
            nodes.save(new NodeEntity(3L, "Peradeniya Camp", 7.2699, 80.5938, NodeType.RESCUE_CAMP));
            nodes.save(new NodeEntity(4L, "Gampola Camp", 7.1647, 80.5696, NodeType.RESCUE_CAMP));
            nodes.save(new NodeEntity(5L, "Isolated Lookout", 7.4000, 80.7000, NodeType.INTERSECTION));

            edges.save(new EdgeEntity(1L, 2L, 8.0, 16.0, false, false));
            edges.save(new EdgeEntity(2L, 3L, 12.0, 24.0, false, false));
            edges.save(new EdgeEntity(1L, 3L, 10.0, 20.0, false, false));
            edges.save(new EdgeEntity(3L, 4L, 15.0, 30.0, false, false));
            edges.save(new EdgeEntity(2L, 4L, 28.0, 50.0, false, false));
        };
    }
}
