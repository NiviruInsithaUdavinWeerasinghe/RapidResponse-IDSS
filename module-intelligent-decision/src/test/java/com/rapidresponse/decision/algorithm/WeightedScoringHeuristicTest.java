package com.rapidresponse.decision.algorithm;

import com.rapidresponse.decision.entity.SOSRequestEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WeightedScoringHeuristicTest {

    private final WeightedScoringHeuristic heuristic =
            new WeightedScoringHeuristic();

    @Test
    void shouldHandleEqualWeights() {

        SOSRequestEntity request1 = createRequest(
                1L,

                "Camp A",
                5,
                100,
                5,
                20
        );

        SOSRequestEntity request2 = createRequest(
                2L,
                "Camp B",
                8,
                150,
                8,
                20
        );

        ScoringResult result = heuristic.score(
                List.of(request1, request2),
                40,
                1.0,
                1.0,
                1.0
        );

        assertEquals(2, result.getRankedRequests().size());

        assertEquals(
                "Camp B",
                result.getRankedRequests().get(0).getCampName()
        );

        assertEquals(
                1.0,
                result.getRankedRequests().get(0).getNormalizedScore()
        );

        assertEquals(
                0.0,
                result.getRankedRequests().get(1).getNormalizedScore()
        );
    }

    @Test
    void shouldPrioritizeSeverityWhenSeverityWeightIsHigher() {

        SOSRequestEntity highSeverity = createRequest(
                1L,
                "Critical Camp",
                10,
                10,
                1,
                20
        );

        SOSRequestEntity highPopulation = createRequest(
                2L,
                "Large Camp",
                1,
                50,
                1,
                20
        );

        ScoringResult result = heuristic.score(
                List.of(highSeverity, highPopulation),
                40,
                10.0,
                0.1,
                0.1
        );

        assertEquals(
                1L,
                result.getRankedRequests()
                        .get(0)
                        .getRequestId()
        );
    }

    @Test
    void shouldSelectAllRequestsWhenAllFit() {

        SOSRequestEntity request1 = createRequest(
                1L,
                "Camp A",
                5,
                100,
                5,
                10
        );

        SOSRequestEntity request2 = createRequest(
                2L,
                "Camp B",
                7,
                200,
                6,
                10
        );

        SOSRequestEntity request3 = createRequest(
                3L,
                "Camp C",
                8,
                300,
                7,
                10
        );

        ScoringResult result = heuristic.score(
                List.of(request1, request2, request3),
                30,
                1.0,
                1.0,
                1.0
        );

        assertEquals(
                3,
                result.getSelectedRequests().size()
        );

        assertEquals(
                30.0,
                result.getTotalCostUsed()
        );
    }

    @Test
    void shouldSelectNoneWhenNoRequestFits() {

        SOSRequestEntity request1 = createRequest(
                1L,
                "Camp A",
                10,
                100,
                10,
                50
        );

        SOSRequestEntity request2 = createRequest(
                2L,
                "Camp B",
                8,
                200,
                8,
                60
        );

        ScoringResult result = heuristic.score(
                List.of(request1, request2),
                20,
                1.0,
                1.0,
                1.0
        );

        assertTrue(
                result.getSelectedRequests().isEmpty()
        );

        assertEquals(
                0.0,
                result.getTotalCostUsed()
        );
    }

    private SOSRequestEntity createRequest(
            Long id,
            String campName,
            int injurySeverity,
            int campPopulation,
            int supplyShortage,
            double resourceCost
    ) {

        SOSRequestEntity entity = new SOSRequestEntity();

        entity.setId(id);
        entity.setCampName(campName);
        entity.setInjurySeverity(injurySeverity);
        entity.setCampPopulation(campPopulation);
        entity.setSupplyShortageLevel(supplyShortage);
        entity.setResourceCost(resourceCost);

        return entity;
    }
}