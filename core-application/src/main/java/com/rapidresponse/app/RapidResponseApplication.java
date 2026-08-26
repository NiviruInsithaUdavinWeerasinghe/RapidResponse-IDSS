package com.rapidresponse.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.rapidresponse")
@EntityScan(basePackages = "com.rapidresponse")
@EnableJpaRepositories(basePackages = "com.rapidresponse")
public class RapidResponseApplication {
    public static void main(String[] args) {
        SpringApplication.run(RapidResponseApplication.class, args);
    }
}
