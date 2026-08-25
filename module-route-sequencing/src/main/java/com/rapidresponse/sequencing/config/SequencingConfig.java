package com.rapidresponse.sequencing.config;

import com.rapidresponse.route.algorithm.DijkstraPathfinder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration for Module 5 Route Sequencing beans.
 *
 * <p>Registers the DijkstraPathfinder from module-route-optimization as a
 * Spring bean so it can be injected into DistanceMatrixBuilder without
 * modifying Module 1's source files.
 */
@Configuration
public class SequencingConfig {

    @Bean
    public DijkstraPathfinder dijkstraPathfinder() {
        return new DijkstraPathfinder();
    }
}
