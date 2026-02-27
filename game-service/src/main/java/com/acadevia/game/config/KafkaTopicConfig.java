package com.acadevia.game.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic gameCompletedTopic() {
        return TopicBuilder.name("acadevia.game.completed")
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic multiplayerGameCompletedTopic() {
        return TopicBuilder.name("acadevia.game.multiplayer-completed")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
