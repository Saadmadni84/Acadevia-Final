package com.acadevia.course.controller;

import com.acadevia.course.dto.request.CompleteLessonRequest;
import com.acadevia.course.dto.response.CourseProgressResponse;
import com.acadevia.course.dto.response.LessonProgressResponse;
import com.acadevia.course.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/lessons/{lessonId}/start")
    public ResponseEntity<LessonProgressResponse> startLesson(
            @PathVariable Long lessonId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(progressService.startLesson(lessonId, userId));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonProgressResponse> updateProgress(
            @PathVariable Long lessonId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Integer timeSpent,
            @RequestParam(required = false) Integer lastPosition,
            @RequestParam(required = false) Double percentage) {
        return ResponseEntity.ok(progressService.updateLessonProgress(lessonId, userId, timeSpent, lastPosition, percentage));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<LessonProgressResponse> completeLesson(
            @PathVariable Long lessonId,
            @RequestBody(required = false) @Valid CompleteLessonRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(progressService.completeLesson(lessonId, request, userId));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseProgressResponse> getCourseProgress(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(progressService.getCourseProgress(courseId, userId));
    }

    @GetMapping("/courses/{courseId}/modules/{moduleId}")
    public ResponseEntity<List<LessonProgressResponse>> getModuleProgress(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(progressService.getModuleProgress(courseId, moduleId, userId));
    }
}
