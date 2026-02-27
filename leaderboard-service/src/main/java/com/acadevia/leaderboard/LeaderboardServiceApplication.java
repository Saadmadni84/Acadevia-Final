package com.acadevia.leaderboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
@EnableKafka
public class LeaderboardServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LeaderboardServiceApplication.class, args);
    }
}
