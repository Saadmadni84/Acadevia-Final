package com.acadevia.course.service;

import com.acadevia.course.dto.response.EnrollmentResponse;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;

public interface EnrollmentService {
    EnrollmentResponse enrollInCourse(Long courseId, Long userId);

    PagedResponse<EnrollmentResponse> getMyEnrollments(Long userId, String status, int page, int size);

    EnrollmentResponse getEnrollmentStatus(Long courseId, Long userId);

    MessageResponse dropCourse(Long courseId, Long userId);

    MessageResponse pauseCourse(Long courseId, Long userId);

    MessageResponse resumeCourse(Long courseId, Long userId);

    PagedResponse<EnrollmentResponse> getCourseEnrollments(Long courseId, int page, int size); // TEACHER
}
