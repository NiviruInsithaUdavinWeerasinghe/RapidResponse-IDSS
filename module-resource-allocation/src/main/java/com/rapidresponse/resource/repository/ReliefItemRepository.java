package com.rapidresponse.resource.repository;

import com.rapidresponse.resource.entity.ReliefCategory;
import com.rapidresponse.resource.entity.ReliefItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReliefItemRepository extends JpaRepository<ReliefItemEntity, Long> {
    List<ReliefItemEntity> findByCategory(ReliefCategory category);
}
