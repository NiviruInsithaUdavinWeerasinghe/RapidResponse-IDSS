package com.rapidresponse.app.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Smart Disaster Relief DSS — REST API",
        version = "1.0.0",
        description = "REST API definitions and endpoints for the Smart Disaster Relief Decision Support System (SDR-DSS)."
    ),
    tags = {
        @Tag(name = "Route Optimization", description = "Endpoints for finding the shortest path (Dijkstra/A*)"),
        @Tag(name = "Resource Allocation", description = "Endpoints for knapsack-based resource allocation packing"),
        @Tag(name = "Network Analysis", description = "Endpoints for road network connectivity and MST calculations"),
        @Tag(name = "Intelligent Decision", description = "Endpoints for scoring and ranking emergency SOS requests"),
        @Tag(name = "Route Sequencing", description = "Endpoints for sequencing camp delivery routes (TSP)"),
        @Tag(name = "Pipeline", description = "Endpoints for end-to-end multi-module pipeline execution"),
        @Tag(name = "Benchmark", description = "Endpoints for benchmarking and comparing algorithms performance")
    }
)
public class OpenApiConfig {
}
