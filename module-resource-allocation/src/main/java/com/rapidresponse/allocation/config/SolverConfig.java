package com.rapidresponse.allocation.config;

import com.rapidresponse.allocation.solver.ResourceSelectable;
import com.rapidresponse.shared.algorithm.BranchAndBoundSolver;
import com.rapidresponse.shared.algorithm.GreedySubsetSolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolverConfig {

    @Bean
    public BranchAndBoundSolver<ResourceSelectable> branchAndBoundSolver() {
        return new BranchAndBoundSolver<>();
    }

    @Bean
    public GreedySubsetSolver<ResourceSelectable> greedySubsetSolver() {
        return new GreedySubsetSolver<>();
    }
}