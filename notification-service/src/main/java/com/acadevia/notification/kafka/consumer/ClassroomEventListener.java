package com.acadevia.notification.kafka.consumer;

import com.acadevia.notification.dto.kafka.ClassroomAnnouncementEvent;
import com.acadevia.notification.dto.kafka.AssignmentCreatedEvent;
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
public class ClassroomEventListener {

    private final NotificationDispatcher notificationDispatcher;

    @KafkaListener(topics = "classroom.announcement", groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleAnnouncement(ClassroomAnnouncementEvent event) {
        log.info("Received ClassroomAnnouncementEvent for classroom: {}", event.getClassroomId());
        
        for (Long studentId : event.getStudentIds()) {
            notificationDispatcher.dispatch(
                    studentId,
                    NotificationCategory.CLASSROOM,
                    "New Announcement: " + event.getTitle(),
                    event.getContent().substring(0, Math.min(event.getContent().length(), 100)) + "...",
                    Map.of(
                            "classroomId", event.getClassroomId(),
                            "teacherName", event.getTeacherName()
                    ),
                    NotificationPriority.HIGH,
                    "/classroom/" + event.getClassroomId()
            );
        }
    }

    @KafkaListener(topics = "assignment.created", groupId = Constants.GROUP_ID_NOTIFICATION)
    public void handleAssignmentCreated(AssignmentCreatedEvent event) {
        log.info("Received AssignmentCreatedEvent for classroom: {}", event.getClassroomId());
        
        for (Long studentId : event.getStudentIds()) {
            notificationDispatcher.dispatch(
                    studentId,
                    NotificationCategory.ASSIGNMENT,
                    "New Assignment: " + event.getTitle(),
                    "Due date: " + event.getDueDate(),
                    Map.of(
                            "assignmentId", event.getAssignmentId(),
                            "classroomId", event.getClassroomId(),
                            "subject", event.getSubject()
                    ),
                    NotificationPriority.HIGH,
                    "/assignments/" + event.getAssignmentId()
            );
        }
    }
}
