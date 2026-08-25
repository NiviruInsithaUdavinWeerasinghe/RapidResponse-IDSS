package com.rapidresponse.decision.repository;

import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.model.SOSStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SOSRequestRepository extends JpaRepository<SOSRequestEntity, Long> {

    List<SOSRequestEntity> findByStatus(SOSStatus status);

    List<SOSRequestEntity> findByRescueCampId(Long campId);
}