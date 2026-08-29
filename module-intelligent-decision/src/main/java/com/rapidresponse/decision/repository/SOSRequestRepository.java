package com.rapidresponse.decision.repository;

import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.entity.SOSStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SOSRequestRepository extends JpaRepository<SOSRequestEntity, Long> {

    List<SOSRequestEntity> findByStatus(SOSStatus status);

    List<SOSRequestEntity> findAllByStatusOrderByIdAsc(SOSStatus status);

    List<SOSRequestEntity> findByCampId(Long campId);
}
