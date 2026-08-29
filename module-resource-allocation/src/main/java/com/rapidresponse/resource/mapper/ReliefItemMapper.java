package com.rapidresponse.resource.mapper;

import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.model.ReliefItem;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReliefItemMapper {

    ReliefItem toDomain(ReliefItemEntity entity);

    List<ReliefItem> toDomainList(List<ReliefItemEntity> entities);
}
