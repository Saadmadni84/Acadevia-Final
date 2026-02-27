package com.acadevia.course.controller;

import com.acadevia.course.dto.request.CourseFilterRequest;
import com.acadevia.course.dto.request.CreateCourseRequest;
import com.acadevia.course.dto.request.UpdateCourseRequest;
import com.acadevia.course.dto.response.*;
import com.acadevia.course.service.CourseService;
import com.acadevia.course.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<PagedResponse<CourseCardResponse>> getAllCourses(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {
        return ResponseEntity.ok(courseService.getAllPublishedCourses(page, size, sortBy, direction));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponse> getCourseById(
            @PathVariable Long courseId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId, userId));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<CourseCardResponse>> searchCourses(
            @RequestParam("query") String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(courseService.searchCourses(query, page, size));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<PopularCourseResponse>> getPopularCourses() {
        return ResponseEntity.ok(courseService.getPopularCourses());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<CourseCardResponse>> getFeaturedCourses() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<CourseCardResponse>> getRecommendedCourses(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(required = false) Integer classGrade,
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String language) {
        return ResponseEntity.ok(courseService.getRecommendedCourses(userId, classGrade, board, language));
    }
    
    @PostMapping("/filter")
    public ResponseEntity<PagedResponse<CourseCardResponse>> filterCourses(
            @RequestBody CourseFilterRequest filterRequest,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(courseService.getFilteredCourses(filterRequest, page, size));
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CreateCourseRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        // In real app, verify role is TEACHER
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(request, teacherId));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request, teacherId));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<MessageResponse> deleteCourse(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(courseService.deleteCourse(courseId, teacherId));
    }

    @PostMapping("/{courseId}/submit")
    public ResponseEntity<MessageResponse> submitForReview(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(courseService.submitForReview(courseId, teacherId));
    }

    // Admin endpoints would typically be secured and under /admin/courses or verify role
    @PostMapping("/{courseId}/publish")
    public ResponseEntity<MessageResponse> publishCourse(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long adminId) {
        // Validation for admin role would be here
        return ResponseEntity.ok(courseService.publishCourse(courseId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<PagedResponse<CourseCardResponse>> getTeacherCourses(
            @PathVariable Long teacherId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(courseService.getTeacherCourses(teacherId, page, size));
    }

    @GetMapping("/{courseId}/stats")
    public ResponseEntity<CourseStatsResponse> getCourseStats(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(courseService.getCourseStats(courseId, teacherId));
    }

    @PostMapping("/{courseId}/favorite")
    public ResponseEntity<MessageResponse> toggleFavorite(
            @PathVariable Long courseId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(courseService.toggleFavorite(courseId, userId));
    }

    @GetMapping("/favorites")
    public ResponseEntity<PagedResponse<CourseCardResponse>> getMyFavorites(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(courseService.getFavorites(userId, page, size));
    }
}
