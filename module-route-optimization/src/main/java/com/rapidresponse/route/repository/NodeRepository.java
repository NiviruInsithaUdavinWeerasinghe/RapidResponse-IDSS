package com.rapidresponse.route.repository;

import com.rapidresponse.route.entity.NodeEntity;
import com.rapidresponse.route.model.NodeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<NodeEntity, Long> {
    List<NodeEntity> findByNodeType(NodeType nodeType);
}
