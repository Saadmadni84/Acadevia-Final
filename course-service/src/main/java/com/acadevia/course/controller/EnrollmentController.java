package com.acadevia.course.controller;

import com.acadevia.course.dto.response.EnrollmentResponse;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;
import com.acadevia.course.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enrollInCourse(courseId, userId));
    }

    @GetMapping("/my")
    public ResponseEntity<PagedResponse<EnrollmentResponse>> getMyEnrollments(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(userId, status, page, size));
    }

    @GetMapping("/{courseId}/status")
    public ResponseEntity<EnrollmentResponse> getEnrollmentStatus(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentStatus(courseId, userId));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<MessageResponse> dropCourse(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(enrollmentService.dropCourse(courseId, userId));
    }
    
    // Teacher endpoint
    @GetMapping("/course/{courseId}")
    public ResponseEntity<PagedResponse<EnrollmentResponse>> getCourseEnrollments(
            @PathVariable Long courseId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(enrollmentService.getCourseEnrollments(courseId, page, size));
    }
}
