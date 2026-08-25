package com.rapidresponse.decision.mapper;

import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.model.SOSRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SOSRequestMapper {

    @Mapping(target = "compositeScore", ignore = true)
    SOSRequest toDomain(SOSRequestEntity entity);

    @Mapping(target = "rescueCampId", ignore = true)
    @Mapping(target = "injurySeverity", ignore = true)
    @Mapping(target = "campPopulation", ignore = true)
    @Mapping(target = "supplyShortageLevel", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "receivedAt", ignore = true)
    SOSRequestEntity toEntity(SOSRequest domain);
}