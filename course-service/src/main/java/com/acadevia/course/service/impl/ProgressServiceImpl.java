package com.acadevia.course.service.impl;

import com.acadevia.course.dto.event.CourseCompletedEvent;
import com.acadevia.course.dto.event.LessonCompletedEvent;
import com.acadevia.course.dto.request.CompleteLessonRequest;
import com.acadevia.course.dto.response.CourseProgressResponse;
import com.acadevia.course.dto.response.LessonProgressResponse;
import com.acadevia.course.entity.*;
import com.acadevia.course.enums.EnrollmentStatus;
import com.acadevia.course.enums.LessonStatus;
import com.acadevia.course.exception.ResourceNotFoundException;
import com.acadevia.course.mapper.LessonMapper;
import com.acadevia.course.repository.*;
import com.acadevia.course.service.KafkaEventPublisher;
import com.acadevia.course.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final LessonProgressRepository progressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final KafkaEventPublisher eventPublisher;
    private final LessonMapper lessonMapper;

    @Override
    @Transactional
    public LessonProgressResponse startLesson(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));
        
        // Check enrollment
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, lesson.getModule().getCourse().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "user", userId));
        
        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
             throw new IllegalStateException("Enrollment is not active");
        }

        Optional<LessonProgress> existingProgress = progressRepository.findByUserIdAndLessonId(userId, lessonId);
        if (existingProgress.isPresent()) {
            return mapToProgressResponse(existingProgress.get());
        }

        LessonProgress progress = new LessonProgress();
        progress.setLesson(lesson);
        progress.setUserId(userId);
        progress.setCourseId(lesson.getCourseId());
        progress.setModuleId(lesson.getModule().getId());
        progress.setEnrollment(enrollment);
        progress.setStatus(LessonStatus.IN_PROGRESS);
        progress.setProgressPct(0.0);
        
        LessonProgress savedProgress = progressRepository.save(progress);
        
        // Update enrollment last accessed
        enrollment.setLastAccessedAt(LocalDateTime.now());
        enrollmentRepository.save(enrollment);

        return mapToProgressResponse(savedProgress);
    }

    @Override
    @Transactional
    public LessonProgressResponse updateLessonProgress(Long lessonId, Long userId, Integer timeSpentSec, Integer lastPosition, Double progressPct) {
        LessonProgress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonProgress", "lessonId", lessonId));
        
        progress.setTimeSpentSec(progress.getTimeSpentSec() + (timeSpentSec != null ? timeSpentSec : 0));
        if (lastPosition != null) progress.setLastPosition(lastPosition);
        if (progressPct != null) progress.setProgressPct(progressPct);
        
        return mapToProgressResponse(progressRepository.save(progress));
    }

    @Override
    @Transactional
    public LessonProgressResponse completeLesson(Long lessonId, CompleteLessonRequest request, Long userId) {
         LessonProgress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    // Create if not started (e.g. specialized short lesson)
                    startLesson(lessonId, userId);
                    return progressRepository.findByUserIdAndLessonId(userId, lessonId).get();
                });

        if (progress.getStatus() == LessonStatus.COMPLETED) {
            return mapToProgressResponse(progress);
        }

        progress.setStatus(LessonStatus.COMPLETED);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setProgressPct(100.0);
        if (request != null && request.getTimeSpentSec() != null) {
            progress.setTimeSpentSec(progress.getTimeSpentSec() + request.getTimeSpentSec());
        }
        
        LessonProgress savedProgress = progressRepository.save(progress);
        
        // Publish Lesson Completed Event
        Long courseId = progress.getLesson().getCourseId();
        Long moduleId = progress.getLesson().getModule().getId();
        eventPublisher.publishLessonCompleted(LessonCompletedEvent.builder()
                .userId(userId)
                .lessonId(lessonId)
                .courseId(courseId)
                .moduleId(moduleId)
                .contentType(progress.getLesson().getContentType() != null ? progress.getLesson().getContentType().name() : null)
                .timeSpentSec(progress.getTimeSpentSec())
                .xpReward(progress.getLesson().getXpReward())
                .completedAt(LocalDateTime.now())
                .build());
        
        // Re-calculate course completion
        updateCourseCompletion(userId, courseId);
        
        return mapToProgressResponse(savedProgress);
    }

    private void updateCourseCompletion(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "courseId", courseId));
        
        // Count total lessons
        long totalLessons = lessonRepository.countByCourseId(courseId);
        
        // Count completed lessons
        long completedLessons = progressRepository.countCompletedByUserAndCourse(userId, courseId);
        
        double percentage = totalLessons > 0 ? ((double) completedLessons / totalLessons) * 100 : 0.0;
        enrollment.setProgressPct(percentage);
        
        if (percentage >= 100.0 && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
            Course course = courseRepository.findById(courseId).orElse(null);
            eventPublisher.publishCourseCompleted(CourseCompletedEvent.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .courseTitle(course != null ? course.getTitle() : null)
                    .completionPercentage(percentage)
                    .completedAt(LocalDateTime.now())
                    .build());
        }
        
        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long courseId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "courseId", courseId));
        
        CourseProgressResponse response = new CourseProgressResponse();
        response.setCourseId(courseId);
        response.setOverallProgress(enrollment.getProgressPct());
        response.setStatus(enrollment.getStatus().name());
        
        // We could fetch details per module/lesson here but usually client fetches modules separately
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonProgressResponse> getModuleProgress(Long courseId, Long moduleId, Long userId) {
        // Validation needed that module matches course?
        
        // Fetch all lessons in module
        List<Lesson> lessons = lessonRepository.findByModuleIdAndIsActiveTrueOrderBySequenceOrderAsc(moduleId);
        
        // Fetch existing progress
        List<LessonProgress> progressList = progressRepository.findByUserIdAndModuleId(userId, moduleId);
        
        // Map lessons to progress response, filling in "NOT_STARTED" for missing ones
        return lessons.stream().map(lesson -> {
            Optional<LessonProgress> lp = progressList.stream()
                    .filter(p -> p.getLesson().getId().equals(lesson.getId()))
                    .findFirst();
            
            if (lp.isPresent()) {
                return mapToProgressResponse(lp.get());
            } else {
                LessonProgressResponse resp = new LessonProgressResponse();
                resp.setLessonId(lesson.getId());
                resp.setLessonTitle(lesson.getTitle());
                resp.setIsCompleted(false);
                resp.setProgressPct(0.0);
                return resp;
            }
        }).collect(Collectors.toList());
    }

    private LessonProgressResponse mapToProgressResponse(LessonProgress progress) {
        LessonProgressResponse response = new LessonProgressResponse();
        response.setLessonId(progress.getLesson().getId());
        response.setLessonTitle(progress.getLesson().getTitle());
        response.setIsCompleted(progress.getIsCompleted());
        response.setProgressPct(progress.getProgressPct());
        response.setTimeSpentSec(progress.getTimeSpentSec());
        response.setLastPosition(progress.getLastPosition());
        response.setCompletedAt(progress.getCompletedAt());
        return response;
    }
}
