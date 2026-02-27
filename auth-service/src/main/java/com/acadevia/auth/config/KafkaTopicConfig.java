package com.acadevia.auth.config;

import com.acadevia.auth.util.AppConstants;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic userRegisteredTopic() {
        return TopicBuilder.name(AppConstants.KAFKA_TOPIC_USER_REGISTERED)
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userLoggedInTopic() {
        return TopicBuilder.name(AppConstants.KAFKA_TOPIC_USER_LOGGED_IN)
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic passwordResetTopic() {
        return TopicBuilder.name(AppConstants.KAFKA_TOPIC_PASSWORD_RESET)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
