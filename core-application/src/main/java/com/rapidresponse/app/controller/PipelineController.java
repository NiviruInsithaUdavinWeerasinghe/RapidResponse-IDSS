package com.rapidresponse.app.controller;

import com.rapidresponse.app.dto.request.DecideAndPackRequest;
import com.rapidresponse.app.dto.request.DecideAndSequenceRequest;
import com.rapidresponse.app.dto.request.FullResponsePipelineRequest;
import com.rapidresponse.app.dto.response.DecideAndPackResponse;
import com.rapidresponse.app.dto.response.DecideAndSequenceResponse;
import com.rapidresponse.app.dto.response.FullResponsePipelineResponse;
import com.rapidresponse.app.service.DecideAndPackPipeline;
import com.rapidresponse.app.service.DecideAndSequencePipeline;
import com.rapidresponse.app.service.FullResponsePipeline;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Cross-Module Integration Pipeline REST Controller.
 *
 * <p>Exposes unified endpoints for:
 * <ul>
 *   <li>Issue #29: Module 4 -> Module 2 (Decide & Pack)</li>
 *   <li>Issue #30: Module 4 -> Module 5 (Decide & Sequence)</li>
 *   <li>Issue #31: Full End-to-End Pipeline: Module 3 -> 1 -> 4 -> 2 -> 5 (Full Response)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/pipeline")
@Tag(name = "Integration Pipelines", description = "Cross-module workflow pipelines connecting Intelligent Decision (Module 4) with Resource Packing (Module 2), Network Analysis (Module 3), Route Optimization (Module 1), and Route Sequencing (Module 5)")
@CrossOrigin(origins = "*")
public class PipelineController {

    private final DecideAndPackPipeline decideAndPackPipeline;
    private final DecideAndSequencePipeline decideAndSequencePipeline;
    private final FullResponsePipeline fullResponsePipeline;

    public PipelineController(DecideAndPackPipeline decideAndPackPipeline,
                              DecideAndSequencePipeline decideAndSequencePipeline,
                              FullResponsePipeline fullResponsePipeline) {
        this.decideAndPackPipeline = decideAndPackPipeline;
        this.decideAndSequencePipeline = decideAndSequencePipeline;
        this.fullResponsePipeline = fullResponsePipeline;
    }

    @PostMapping("/decide-and-pack")
    @Operation(summary = "Run Module 4 -> Module 2 Pipeline (Decide & Pack)",
               description = "Selects optimal SOS camp batch via Branch & Bound / Weighted Scoring, and packs optimal relief supplies for delivery.")
    public ResponseEntity<DecideAndPackResponse> decideAndPack(
            @Valid @RequestBody DecideAndPackRequest request) {
        DecideAndPackResponse response = decideAndPackPipeline.execute(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/decide-and-sequence")
    @Operation(summary = "Run Module 4 -> Module 5 Pipeline (Decide & Sequence)",
               description = "Selects optimal SOS camp batch via Module 4, constructs road distance matrix via Module 1, and solves delivery tour sequence via Module 5 (Held-Karp / 2-Opt TSP).")
    public ResponseEntity<DecideAndSequenceResponse> decideAndSequence(
            @Valid @RequestBody DecideAndSequenceRequest request) {
        DecideAndSequenceResponse response = decideAndSequencePipeline.execute(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/full-response")
    @Operation(summary = "Run Full End-to-End Response Pipeline (Modules 3 -> 1 -> 4 -> 2 -> 5)",
               description = "Executes the complete master disaster response workflow: analyzes damaged network (Module 3), runs pre-check reachability validation (Module 1), prioritizes SOS camps (Module 4), packs helicopter payload (Module 2), and sequences optimal delivery tour (Module 5).")
    public ResponseEntity<FullResponsePipelineResponse> fullResponse(
            @Valid @RequestBody FullResponsePipelineRequest request) {
        FullResponsePipelineResponse response = fullResponsePipeline.execute(request);
        return ResponseEntity.ok(response);
    }
}
