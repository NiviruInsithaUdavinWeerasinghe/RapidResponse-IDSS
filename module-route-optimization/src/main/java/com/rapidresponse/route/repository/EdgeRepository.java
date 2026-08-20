package com.rapidresponse.route.repository;

import com.rapidresponse.route.entity.EdgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EdgeRepository extends JpaRepository<EdgeEntity, Long> {
    List<EdgeEntity> findByIsBlocked(boolean isBlocked);
}
