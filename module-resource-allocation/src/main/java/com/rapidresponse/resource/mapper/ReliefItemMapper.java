package com.rapidresponse.resource.mapper;

import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.model.ReliefItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReliefItemMapper {

    public ReliefItem toDomain(ReliefItemEntity entity) {
        if (entity == null) return null;
        return new ReliefItem(entity.getId(), entity.getName(), entity.getWeightKg(), entity.getPriorityValue());
    }

    public List<ReliefItem> toDomainList(List<ReliefItemEntity> entities) {
        if (entities == null) return List.of();
        return entities.stream().map(this::toDomain).collect(Collectors.toList());
    }
}
