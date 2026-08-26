package com.rapidresponse.resource.repository;

import com.rapidresponse.resource.entity.HelicopterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HelicopterRepository extends JpaRepository<HelicopterEntity, Long> {
    List<HelicopterEntity> findByStatus(String status);
}
