package com.rapidresponse.resource.config;

import com.rapidresponse.resource.model.ReliefItem;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolverConfig {

    @Bean
    public BranchAndBoundSolver<ReliefItem> branchAndBoundSolver() {
        return new BranchAndBoundSolver<>();
    }
    @Bean
    public GreedySubsetSolver<ReliefItem> greedySubsetSolver() {
        return new GreedySubsetSolver<>();
    }
}