package com.rapidresponse.decision.mapper;

import com.rapidresponse.decision.dto.request.CreateSOSRequest;
import com.rapidresponse.decision.dto.response.SOSRequestResponse;
import com.rapidresponse.decision.entity.SOSRequestEntity;
import com.rapidresponse.decision.entity.SOSStatus;
import com.rapidresponse.decision.model.SOSRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Mapper and object converter for Module 4 entities, models, and DTOs.
 */
@Component
public class SOSRequestMapper {

    public SOSRequest toDomain(SOSRequestEntity entity) {
        if (entity == null) {
            return null;
        }
        return SOSRequest.builder()
                .id(entity.getId())
                .campId(entity.getCampId())
                .campName(entity.getCampName())
                .injurySeverity(entity.getInjurySeverity())
                .population(entity.getPopulation())
                .supplyShortage(entity.getSupplyShortage())
                .requiredTrucks(entity.getRequiredTrucks())
                .status(entity.getStatus())
                .receivedAt(entity.getReceivedAt())
                .build();
    }

    public List<SOSRequest> toDomainList(List<SOSRequestEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream().map(this::toDomain).toList();
    }

    public SOSRequest fromCreateRequest(CreateSOSRequest req, Long fallbackId) {
        if (req == null) {
            return null;
        }
        return SOSRequest.builder()
                .id(req.getId() != null ? req.getId() : fallbackId)
                .campId(req.getCampId())
                .campName(req.getCampName())
                .injurySeverity(req.getInjurySeverity())
                .population(req.getPopulation())
                .supplyShortage(req.getSupplyShortage())
                .requiredTrucks(req.getRequiredTrucks())
                .status(SOSStatus.PENDING)
                .receivedAt(LocalDateTime.now())
                .build();
    }

    public SOSRequestEntity toEntity(CreateSOSRequest req) {
        if (req == null) {
            return null;
        }
        return SOSRequestEntity.builder()
                .campId(req.getCampId())
                .campName(req.getCampName())
                .injurySeverity(req.getInjurySeverity())
                .population(req.getPopulation())
                .supplyShortage(req.getSupplyShortage())
                .requiredTrucks(req.getRequiredTrucks())
                .status(SOSStatus.PENDING)
                .receivedAt(LocalDateTime.now())
                .build();
    }

    public SOSRequestResponse toResponse(SOSRequest model) {
        if (model == null) {
            return null;
        }
        return SOSRequestResponse.builder()
                .id(model.getId())
                .campId(model.getCampId())
                .campName(model.getCampName())
                .injurySeverity(model.getInjurySeverity())
                .population(model.getPopulation())
                .supplyShortage(model.getSupplyShortage())
                .requiredTrucks(model.getRequiredTrucks())
                .status(model.getStatus())
                .receivedAt(model.getReceivedAt())
                .normalizedSeverity(round(model.getNormalizedSeverity()))
                .normalizedPopulation(round(model.getNormalizedPopulation()))
                .normalizedShortage(round(model.getNormalizedShortage()))
                .compositeScore(round(model.getCompositeScore()))
                .build();
    }

    public SOSRequestResponse entityToResponse(SOSRequestEntity entity) {
        if (entity == null) {
            return null;
        }
        return SOSRequestResponse.builder()
                .id(entity.getId())
                .campId(entity.getCampId())
                .campName(entity.getCampName())
                .injurySeverity(entity.getInjurySeverity())
                .population(entity.getPopulation())
                .supplyShortage(entity.getSupplyShortage())
                .requiredTrucks(entity.getRequiredTrucks())
                .status(entity.getStatus())
                .receivedAt(entity.getReceivedAt())
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
