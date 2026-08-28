package com.rapidresponse.route.algorithm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.rapidresponse.route.model.PathResult;

final class PathReconstruction {

    private PathReconstruction() {
    }

    static PathResult fromParents(Long targetId, Map<Long, Long> parentMap,
                                  Map<Long, Double> distances, Map<Long, Double> travelTimes,
                                  int nodesExplored, long executionTimeNanos) {
        List<Long> path = new ArrayList<>();
        Long current = targetId;
        while (current != null) {
            path.add(current);
            current = parentMap.get(current);
        }
        Collections.reverse(path);
        return PathResult.success(
                path,
                distances.getOrDefault(targetId, 0.0),
                travelTimes.getOrDefault(targetId, 0.0),
                nodesExplored,
                executionTimeNanos
        );
    }
}
