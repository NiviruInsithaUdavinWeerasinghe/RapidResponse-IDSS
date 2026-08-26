package com.rapidresponse.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.rapidresponse")
@EntityScan(basePackages = "com.rapidresponse.shared.entity")
@EnableJpaRepositories(basePackages = "com.rapidresponse.shared.repository")
public class RapidResponseApplication {

    public static void main(String[] args) {
        SpringApplication.run(RapidResponseApplication.class, args);
    }
}
