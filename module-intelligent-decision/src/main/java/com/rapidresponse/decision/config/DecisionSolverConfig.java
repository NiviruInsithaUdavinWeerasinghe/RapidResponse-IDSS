package com.rapidresponse.decision.config;

import com.rapidresponse.decision.model.SOSRequest;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DecisionSolverConfig {

    @Bean
    public BranchAndBoundSolver<SOSRequest> sosBranchAndBoundSolver() {
        return new BranchAndBoundSolver<>();
    }
}
