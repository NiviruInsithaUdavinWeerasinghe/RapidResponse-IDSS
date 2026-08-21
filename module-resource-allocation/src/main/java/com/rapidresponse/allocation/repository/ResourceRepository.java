package com.rapidresponse.allocation.repository;

import com.rapidresponse.allocation.entity.ResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<ResourceEntity, Long> {
}
