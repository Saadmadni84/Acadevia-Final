package com.acadevia.notification.kafka.consumer;

import com.acadevia.notification.dto.kafka.CourseCompletedEvent;
import com.acadevia.notification.dto.kafka.QuizCompletedEvent;
import com.acadevia.notification.enums.NotificationCategory;
import com.acadevia.notification.enums.NotificationPriority;
import com.acadevia.notification.service.NotificationDispatcher;
import com.acadevia.notification.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class CourseEventListener {

    private final NotificationDispatcher notificationDispatcher;

    @KafkaListener(topics = "course.completed", groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleCourseCompleted(CourseCompletedEvent event) {
        log.info("Received CourseCompletedEvent for user: {}", event.getUserId());
        
        notificationDispatcher.dispatch(
                event.getUserId(),
                NotificationCategory.COURSE,
                "Course Completed!",
                "You have completed the course: " + event.getCourseName(),
                Map.of(
                        "courseId", event.getCourseId(),
                        "xpAwarded", event.getXpAwarded()
                ),
                NotificationPriority.HIGH,
                "/courses/" + event.getCourseId()
        );
    }

    @KafkaListener(topics = "quiz.completed", groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleQuizCompleted(QuizCompletedEvent event) {
        log.info("Received QuizCompletedEvent for user: {}", event.getUserId());
        
        notificationDispatcher.dispatch(
                event.getUserId(),
                NotificationCategory.QUIZ,
                "Quiz Results Available",
                "You scored " + event.getScore() + "/" + event.getMaxScore() + " in " + event.getQuizTitle(),
                Map.of(
                        "quizId", event.getQuizId(),
                        "score", event.getScore()
                ),
                NotificationPriority.MEDIUM,
                "/quiz/results/" + event.getQuizId()
        );
    }
}
