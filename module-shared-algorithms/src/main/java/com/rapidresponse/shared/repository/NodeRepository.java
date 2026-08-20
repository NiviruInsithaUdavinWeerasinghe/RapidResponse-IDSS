package com.rapidresponse.shared.repository;

import com.rapidresponse.shared.entity.NodeEntity;
import com.rapidresponse.shared.model.NodeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<NodeEntity, Long> {
    List<NodeEntity> findByNodeType(NodeType nodeType);
}
