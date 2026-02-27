package com.acadevia.course.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

import static com.acadevia.course.util.AppConstants.*;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic courseEnrolledTopic() {
        return TopicBuilder.name(KAFKA_TOPIC_COURSE_ENROLLED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic lessonCompletedTopic() {
        return TopicBuilder.name(KAFKA_TOPIC_LESSON_COMPLETED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic courseCompletedTopic() {
        return TopicBuilder.name(KAFKA_TOPIC_COURSE_COMPLETED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic coursePublishedTopic() {
        return TopicBuilder.name(KAFKA_TOPIC_COURSE_PUBLISHED).partitions(3).replicas(1).build();
    }
    
    @Bean
    public NewTopic courseRatedTopic() {
        return TopicBuilder.name(KAFKA_TOPIC_COURSE_RATED).partitions(3).replicas(1).build();
    }
}
