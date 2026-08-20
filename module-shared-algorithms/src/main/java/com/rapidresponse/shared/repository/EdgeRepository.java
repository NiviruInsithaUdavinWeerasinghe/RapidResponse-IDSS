package com.rapidresponse.shared.repository;

import com.rapidresponse.shared.entity.EdgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EdgeRepository extends JpaRepository<EdgeEntity, Long> {
    List<EdgeEntity> findByBlocked(boolean blocked);
}
