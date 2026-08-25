package com.rapidresponse.decision.mapper;

import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.model.SOSRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SOSRequestMapper {

    @Mapping(target = "compositeScore", ignore = true)
    SOSRequest toDomain(SOSRequestEntity entity);

    SOSRequestEntity toEntity(SOSRequest domain);
}