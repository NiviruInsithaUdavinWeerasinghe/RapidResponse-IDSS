package com.rapidresponse.app.dto.request;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import java.util.List;

/**
 * Request payload for the Master Full End-to-End Pipeline.
 *
 * <p>Orchestrates all 5 modules in dependency sequence:
 * Module 3 (Network Analysis) ➔ Module 1 (Route Pre-Check) ➔ Module 4 (Intelligent Decision)
 * ➔ Module 2 (Resource Allocation) ➔ Module 5 (Route Sequencing)
 */
public record FullResponsePipelineRequest(
        Long hqNodeId,                            // HQ/Depot Node ID (defaults to 1L)
        Long helicopterId,                        // Helicopter ID for resource packing (defaults to 1L)
        Double maxDailyCapacity,                  // Daily rescue truck/team capacity limit (defaults to 15.0)
        Double severityWeight,                    // Weight for severity in decision making (default: 0.5)
        Double populationWeight,                  // Weight for population in decision making (default: 0.3)
        Double shortageWeight,                    // Weight for resource shortage in decision making (default: 0.2)
        List<Long> reliefItemIds,                 // Optional candidate item IDs for helicopter payload
        List<CreateSOSRequest> directSOSRequests, // Optional inline SOS requests (overrides DB pending list)
        String decisionAlgorithm,                 // "EXACT" | "HEURISTIC" (defaults to EXACT)
        String packingAlgorithm,                  // "EXACT" | "HEURISTIC" (defaults to EXACT)
        String sequencingAlgorithm                // "HELD_KARP" | "TWO_OPT" | "AUTO" (defaults to AUTO)
) {
}
