package com.rapidresponse.sequencing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SequencingRequest(
    @NotNull(message = "depotNodeId must not be null")
    Long depotNodeId,

    @NotNull(message = "stopNodeIds must not be null")
    @Size(min = 2, max = 20, message = "stopNodeIds size must be between 2 and 20")
    List<Long> stopNodeIds
) {}
