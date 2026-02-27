package com.acadevia.course.controller;

import com.acadevia.course.dto.request.CreateLessonRequest;
import com.acadevia.course.dto.request.ReorderLessonsRequest;
import com.acadevia.course.dto.request.UpdateLessonRequest;
import com.acadevia.course.dto.response.LessonDetailResponse;
import com.acadevia.course.dto.response.LessonResponse;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    // Nested under modules for creation/listing
    @GetMapping("/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<List<LessonResponse>> getLessonsByModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(lessonService.getLessonsByModule(courseId, moduleId));
    }

    @PostMapping("/courses/{courseId}/modules/{moduleId}/lessons")
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody CreateLessonRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.createLesson(courseId, moduleId, request, teacherId));
    }
    
    // Direct access for fetching detail, updating, deleting (often cleaner URL structure)
    // Or we could keep deep nesting. Let's provide direct access endpoints for easier use 
    // when we already have the ID.

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getLesson(
            @PathVariable Long lessonId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(lessonService.getLessonById(lessonId, userId));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(lessonService.updateLesson(lessonId, request, teacherId));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<MessageResponse> deleteLesson(
            @PathVariable Long lessonId,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(lessonService.deleteLesson(lessonId, teacherId));
    }

    @PostMapping("/courses/{courseId}/modules/{moduleId}/lessons/reorder")
    public ResponseEntity<MessageResponse> reorderLessons(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody ReorderLessonsRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(lessonService.reorderLessons(moduleId, request, teacherId));
    }
}
