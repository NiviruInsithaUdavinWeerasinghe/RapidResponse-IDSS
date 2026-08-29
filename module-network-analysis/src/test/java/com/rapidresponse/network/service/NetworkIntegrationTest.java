package com.rapidresponse.network.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.rapidresponse.network.TestApplication;
import com.rapidresponse.network.dto.ComponentsResponse;
import com.rapidresponse.network.dto.ConnectivityResponse;
import com.rapidresponse.network.dto.MstResponse;
import com.rapidresponse.network.dto.ReachabilityResponse;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;

@SpringBootTest(classes = TestApplication.class, properties = "spring.config.name=application-test")
public class NetworkIntegrationTest {

    @Autowired
    private NetworkService networkService;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private EdgeRepository edgeRepository;

    @BeforeEach
    void setUp() {
        edgeRepository.deleteAll();
        nodeRepository.deleteAll();
        
        // 1. Create a sample graph
        // Nodes:
        // 1: HQ
        // 2, 3: Reachable camps
        // 4, 5: Blocked/isolated camps
        nodeRepository.save(new NodeEntity(1L, "HQ", 0.0, 0.0, NodeType.HQ));
        nodeRepository.save(new NodeEntity(2L, "Camp A", 0.0, 0.0, NodeType.RESCUE_CAMP));
        nodeRepository.save(new NodeEntity(3L, "Camp B", 0.0, 0.0, NodeType.RESCUE_CAMP));
        nodeRepository.save(new NodeEntity(4L, "Camp C", 0.0, 0.0, NodeType.RESCUE_CAMP));
        nodeRepository.save(new NodeEntity(5L, "Camp D", 0.0, 0.0, NodeType.RESCUE_CAMP));
        
        // Edges:
        // Unblocked: 1-2, 2-3 (Component 1)
        // Blocked: 3-4 (cost 5.0), 1-4 (cost 10.0), 4-5 (cost 2.0)
        edgeRepository.save(new EdgeEntity(1L, 2L, 1.0, 1.0, false, false));
        edgeRepository.save(new EdgeEntity(2L, 3L, 2.0, 2.0, false, false));
        edgeRepository.save(new EdgeEntity(3L, 4L, 5.0, 5.0, true, false));
        edgeRepository.save(new EdgeEntity(1L, 4L, 10.0, 10.0, true, false));
        edgeRepository.save(new EdgeEntity(4L, 5L, 2.0, 2.0, true, false));
    }

    @Test
    void integrationTest_loadSampleGraph_and_verifyAnalysis() {
        // Step 1: Run BFS reachability
        ReachabilityResponse reachabilityResponse = networkService.analyseReachability();
        assertNotNull(reachabilityResponse);
        assertEquals(2, reachabilityResponse.getTotalReachable(), "Camp A and Camp B should be reachable");
        assertEquals(2, reachabilityResponse.getIsolatedCamps().size(), "Camp C and Camp D should be isolated");

        // Step 2: Run DFS components
        ComponentsResponse componentsResponse = networkService.analyseComponents();
        assertNotNull(componentsResponse);
        // Components: {1, 2, 3}, {4}, {5} because roads 3-4, 1-4, 4-5 are blocked
        assertEquals(3, componentsResponse.getTotalComponents());
        
        // Step 3: Run Kruskal's MST to reconnect
        MstResponse mstResponse = networkService.computeMst();
        assertNotNull(mstResponse);
        // We need 2 edges to connect the 3 components.
        // Blocked edges: 4-5 (cost 2), 3-4 (cost 5), 1-4 (cost 10).
        // Best to pick 4-5 and 3-4.
        assertEquals(2, mstResponse.getRoadsToClear().size());
        assertEquals(7.0, mstResponse.getTotalCost());
        
        // Step 4: Verify Union-Find connectivity queries after MST
        ConnectivityResponse conn1 = networkService.checkConnectivity(1L, 5L);
        assertTrue(conn1.isConnected(), "Should be connected after MST");
        assertEquals(1, conn1.getTotalComponents(), "Entire graph should be 1 component now");
    }
}
