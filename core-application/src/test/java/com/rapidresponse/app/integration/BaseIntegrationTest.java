package com.rapidresponse.app.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rapidresponse.app.RapidResponseApplication;
import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.entity.SOSStatus;
import com.rapidresponse.decision.repository.SOSRequestRepository;
import com.rapidresponse.resource.entity.HelicopterEntity;
import com.rapidresponse.resource.entity.ReliefCategory;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.repository.HelicopterRepository;
import com.rapidresponse.resource.repository.ReliefItemRepository;
import com.rapidresponse.shared.entity.EdgeEntity;
import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.NodeType;
import com.rapidresponse.shared.repository.EdgeRepository;
import com.rapidresponse.shared.repository.NodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest(classes = RapidResponseApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected NodeRepository nodeRepository;

    @Autowired
    protected EdgeRepository edgeRepository;

    @Autowired
    protected HelicopterRepository helicopterRepository;

    @Autowired
    protected ReliefItemRepository reliefItemRepository;

    @Autowired
    protected SOSRequestRepository sosRequestRepository;

    protected HelicopterEntity testHelicopter;
    protected List<ReliefItemEntity> testItems;

    @BeforeEach
    void setupBaseTestData() {
        edgeRepository.deleteAll();
        nodeRepository.deleteAll();
        reliefItemRepository.deleteAll();
        helicopterRepository.deleteAll();
        sosRequestRepository.deleteAll();

        // 1. Seed Nodes
        NodeEntity hq = new NodeEntity(1L, "Central HQ Depot", 6.9271, 79.8612, NodeType.HQ);
        NodeEntity camp2 = new NodeEntity(2L, "Alpha Sector Camp", 6.9350, 79.8700, NodeType.RESCUE_CAMP);
        NodeEntity camp3 = new NodeEntity(3L, "Bravo Valley Shelter", 6.9450, 79.8800, NodeType.RESCUE_CAMP);
        NodeEntity camp4 = new NodeEntity(4L, "Charlie Hill Station", 6.9550, 79.8900, NodeType.RESCUE_CAMP);
        NodeEntity isolated = new NodeEntity(5L, "Isolated Delta Camp", 7.1000, 80.1000, NodeType.RESCUE_CAMP);

        nodeRepository.save(hq);
        nodeRepository.save(camp2);
        nodeRepository.save(camp3);
        nodeRepository.save(camp4);
        nodeRepository.save(isolated);

        // 2. Seed Connected Edges
        edgeRepository.save(new EdgeEntity(1L, 2L, 5.2, 10.0, false, false));
        edgeRepository.save(new EdgeEntity(2L, 3L, 4.1, 8.0, false, false));
        edgeRepository.save(new EdgeEntity(3L, 4L, 6.3, 12.0, false, false));
        edgeRepository.save(new EdgeEntity(1L, 4L, 14.5, 25.0, false, false));
        edgeRepository.save(new EdgeEntity(4L, 5L, 20.0, 35.0, true, false));

        // 3. Seed Helicopter
        testHelicopter = helicopterRepository.save(new HelicopterEntity(null, "Air Ambulance Alpha", 500.0, "AVAILABLE"));

        // 4. Seed Relief Items
        ReliefItemEntity i1 = reliefItemRepository.save(new ReliefItemEntity(null, "Trauma Medical Kit", 25.0, 95.0, ReliefCategory.MEDICAL));
        ReliefItemEntity i2 = reliefItemRepository.save(new ReliefItemEntity(null, "Emergency Food Rations", 50.0, 80.0, ReliefCategory.FOOD));
        ReliefItemEntity i3 = reliefItemRepository.save(new ReliefItemEntity(null, "Water Purification Units", 40.0, 88.0, ReliefCategory.WATER));
        ReliefItemEntity i4 = reliefItemRepository.save(new ReliefItemEntity(null, "Emergency Blankets", 15.0, 45.0, ReliefCategory.SHELTER));
        testItems = List.of(i1, i2, i3, i4);

        // 5. Seed SOS Requests
        SOSRequestEntity req1 = new SOSRequestEntity();
        req1.setCampId(2L);
        req1.setCampName("Alpha Sector Camp");
        req1.setInjurySeverity(9.0);
        req1.setPopulation(800.0);
        req1.setSupplyShortage(90.0);
        req1.setRequiredTrucks(3.0);
        req1.setStatus(SOSStatus.PENDING);
        req1.setReceivedAt(LocalDateTime.now());
        sosRequestRepository.save(req1);

        SOSRequestEntity req2 = new SOSRequestEntity();
        req2.setCampId(3L);
        req2.setCampName("Bravo Valley Shelter");
        req2.setInjurySeverity(7.5);
        req2.setPopulation(400.0);
        req2.setSupplyShortage(60.0);
        req2.setRequiredTrucks(2.0);
        req2.setStatus(SOSStatus.PENDING);
        req2.setReceivedAt(LocalDateTime.now());
        sosRequestRepository.save(req2);
    }
}
