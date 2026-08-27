package com.rapidresponse.resource.mapper;

import com.rapidresponse.resource.entity.ReliefItemEntity;
import com.rapidresponse.resource.model.ReliefItem;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-27T14:20:28+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class ReliefItemMapperImpl implements ReliefItemMapper {

    @Override
    public ReliefItem toDomain(ReliefItemEntity entity) {
        if ( entity == null ) {
            return null;
        }

        ReliefItem reliefItem = new ReliefItem();

        return reliefItem;
    }

    @Override
    public List<ReliefItem> toDomainList(List<ReliefItemEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ReliefItem> list = new ArrayList<ReliefItem>( entities.size() );
        for ( ReliefItemEntity reliefItemEntity : entities ) {
            list.add( toDomain( reliefItemEntity ) );
        }

        return list;
    }
}
