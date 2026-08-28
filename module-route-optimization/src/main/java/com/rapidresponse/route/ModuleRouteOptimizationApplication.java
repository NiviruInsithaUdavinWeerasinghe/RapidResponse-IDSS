package com.rapidresponse.route;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.rapidresponse")
@EntityScan(basePackages = "com.rapidresponse.shared.entity")
@EnableJpaRepositories(basePackages = "com.rapidresponse.shared.repository")
public class ModuleRouteOptimizationApplication {

	public static void main(String[] args) {
		SpringApplication.run(ModuleRouteOptimizationApplication.class, args);
	}

}
