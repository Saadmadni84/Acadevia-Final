package com.acadevia.leaderboard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class SchedulerConfig {

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("lb-scheduler-");
        scheduler.setErrorHandler(t ->
            org.slf4j.LoggerFactory.getLogger("SchedulerError")
                .error("Scheduler error: {}", t.getMessage(), t));
        return scheduler;
    }
}
