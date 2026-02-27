package com.acadevia.course.service;

import com.acadevia.course.dto.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import static com.acadevia.course.util.AppConstants.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishCourseEnrolled(CourseEnrolledEvent event) {
        log.info("Publishing CourseEnrolledEvent for user {} and course {}", event.getUserId(), event.getCourseId());
        kafkaTemplate.send(KAFKA_TOPIC_COURSE_ENROLLED, event.getUserId().toString(), event);
    }

    public void publishLessonCompleted(LessonCompletedEvent event) {
        log.info("Publishing LessonCompletedEvent for user {} and lesson {}", event.getUserId(), event.getLessonId());
        kafkaTemplate.send(KAFKA_TOPIC_LESSON_COMPLETED, event.getUserId().toString(), event);
    }

    public void publishCourseCompleted(CourseCompletedEvent event) {
        log.info("Publishing CourseCompletedEvent for user {} and course {}", event.getUserId(), event.getCourseId());
        kafkaTemplate.send(KAFKA_TOPIC_COURSE_COMPLETED, event.getUserId().toString(), event);
    }

    public void publishCoursePublished(CoursePublishedEvent event) {
        log.info("Publishing CoursePublishedEvent for course {}", event.getCourseId());
        kafkaTemplate.send(KAFKA_TOPIC_COURSE_PUBLISHED, event.getCourseId().toString(), event);
    }

    public void publishCourseRated(CourseRatedEvent event) {
        log.info("Publishing CourseRatedEvent for course {} by user {}", event.getCourseId(), event.getUserId());
        kafkaTemplate.send(KAFKA_TOPIC_COURSE_RATED, event.getCourseId().toString(), event);
    }
}
