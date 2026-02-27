package com.acadevia.admin.service;

import com.acadevia.admin.dto.response.SystemHealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemHealthServiceImpl implements SystemHealthService {

    private final DiscoveryClient discoveryClient;

    private static final List<String> SERVICES = List.of(
            "AUTH-SERVICE", "USER-SERVICE", "COURSE-SERVICE", "QUIZ-SERVICE",
            "GAME-ENGINE-SERVICE", "GAMIFICATION-SERVICE", "LEADERBOARD-SERVICE",
            "STREAK-SERVICE", "WALLET-SERVICE", "ANALYTICS-SERVICE",
            "NOTIFICATION-SERVICE", "LOCALE-SERVICE", "SCHOOL-REGISTRY-SERVICE",
            "CLASSROOM-SERVICE", "VIDEO-SERVICE", "OFFLINE-SYNC-SERVICE"
    );

    @Override
    public SystemHealthResponse checkAllServices() {
        RestTemplate restTemplate = new RestTemplate();
        List<SystemHealthResponse.ServiceStatus> statuses = new ArrayList<>();
        int healthy = 0, unhealthy = 0;

        for (String serviceName : SERVICES) {
            try {
                List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);

                if (instances.isEmpty()) {
                    statuses.add(SystemHealthResponse.ServiceStatus.builder()
                            .serviceName(serviceName).status("DOWN")
                            .url("N/A").responseTimeMs(0L).build());
                    unhealthy++;
                    continue;
                }

                ServiceInstance instance = instances.get(0);
                String healthUrl = instance.getUri() + "/actuator/health";

                long start = System.currentTimeMillis();
                try {
                    restTemplate.getForObject(healthUrl, Map.class);
                    long responseTime = System.currentTimeMillis() - start;

                    statuses.add(SystemHealthResponse.ServiceStatus.builder()
                            .serviceName(serviceName).status("UP")
                            .url(instance.getUri().toString())
                            .responseTimeMs(responseTime).build());
                    healthy++;
                } catch (Exception e) {
                    statuses.add(SystemHealthResponse.ServiceStatus.builder()
                            .serviceName(serviceName).status("DOWN")
                            .url(instance.getUri().toString())
                            .responseTimeMs(System.currentTimeMillis() - start)
                            .details(Map.of("error", e.getMessage())).build());
                    unhealthy++;
                }
            } catch (Exception e) {
                statuses.add(SystemHealthResponse.ServiceStatus.builder()
                        .serviceName(serviceName).status("UNKNOWN")
                        .url("N/A").responseTimeMs(0L).build());
                unhealthy++;
            }
        }

        String overallStatus = unhealthy == 0 ? "HEALTHY" :
                (healthy == 0 ? "CRITICAL" : "DEGRADED");

        return SystemHealthResponse.builder()
                .overallStatus(overallStatus)
                .services(statuses)
                .checkedAt(LocalDateTime.now())
                .build();
    }
}
