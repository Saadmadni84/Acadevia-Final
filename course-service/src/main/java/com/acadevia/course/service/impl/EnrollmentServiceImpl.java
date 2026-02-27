package com.acadevia.course.service.impl;

import com.acadevia.course.dto.event.CourseEnrolledEvent;
import com.acadevia.course.dto.response.EnrollmentResponse;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.PagedResponse;
import com.acadevia.course.entity.Course;
import com.acadevia.course.entity.Enrollment;
import com.acadevia.course.enums.CourseStatus;
import com.acadevia.course.enums.EnrollmentStatus;
import com.acadevia.course.exception.ResourceNotFoundException;
import com.acadevia.course.mapper.EnrollmentMapper;
import com.acadevia.course.repository.CourseRepository;
import com.acadevia.course.repository.EnrollmentRepository;
import com.acadevia.course.service.EnrollmentService;
import com.acadevia.course.service.KafkaEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentMapper enrollmentMapper;
    private final KafkaEventPublisher eventPublisher;

    @Override
    @Transactional
    public EnrollmentResponse enrollInCourse(Long courseId, Long userId) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new IllegalStateException("User already enrolled in this course");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot enroll in a course that is not published");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setUserId(userId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setProgressPct(0.0);
        
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        // Update course enrollment count
        course.setTotalEnrolled(course.getTotalEnrolled() + 1);
        courseRepository.save(course);

        eventPublisher.publishCourseEnrolled(CourseEnrolledEvent.builder()
                .userId(userId)
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .subject(course.getSubject())
                .category(course.getCategory())
                .classGrade(course.getClassGrade())
                .board(course.getBoard() != null ? course.getBoard().name() : null)
                .enrolledAt(LocalDateTime.now())
                .build());

        return enrollmentMapper.toResponse(savedEnrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> getMyEnrollments(Long userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Enrollment> enrollments;
        if (status != null && !status.isEmpty()) {
            EnrollmentStatus enrollmentStatus = EnrollmentStatus.valueOf(status.toUpperCase());
            enrollments = enrollmentRepository.findByUserIdAndStatusOrderByLastAccessedAtDesc(userId, enrollmentStatus, pageable);
        } else {
            enrollments = enrollmentRepository.findByUserIdOrderByLastAccessedAtDesc(userId, pageable);
        }

        return PagedResponse.<EnrollmentResponse>builder()
                .content(enrollments.getContent().stream().map(enrollmentMapper::toResponse).collect(Collectors.toList()))
                .page(enrollments.getNumber())
                .size(enrollments.getSize())
                .totalElements(enrollments.getTotalElements())
                .totalPages(enrollments.getTotalPages())
                .first(enrollments.isFirst())
                .last(enrollments.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentStatus(Long courseId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "userId", userId));
        return enrollmentMapper.toResponse(enrollment);
    }

    @Override
    @Transactional
    public MessageResponse dropCourse(Long courseId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "userId", userId));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
        
        return MessageResponse.builder().message("Course dropped successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional
    public MessageResponse pauseCourse(Long courseId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "userId", userId));
        
        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot pause a completed course");
        }
        
        enrollment.setStatus(EnrollmentStatus.PAUSED);
        enrollmentRepository.save(enrollment);
        return MessageResponse.builder().message("Course paused successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional
    public MessageResponse resumeCourse(Long courseId, Long userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "userId", userId));
        
        if (enrollment.getStatus() == EnrollmentStatus.PAUSED) {
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollmentRepository.save(enrollment);
            return MessageResponse.builder().message("Course resumed successfully").success(true).timestamp(LocalDateTime.now()).build();
        }
        return MessageResponse.builder().message("Course is not paused").success(false).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EnrollmentResponse> getCourseEnrollments(Long courseId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Enrollment> enrollments = enrollmentRepository.findByCourseIdOrderByEnrolledAtDesc(courseId, pageable);
        
        return PagedResponse.<EnrollmentResponse>builder()
                .content(enrollments.getContent().stream().map(enrollmentMapper::toResponse).collect(Collectors.toList()))
                .page(enrollments.getNumber())
                .size(enrollments.getSize())
                .totalElements(enrollments.getTotalElements())
                .totalPages(enrollments.getTotalPages())
                .first(enrollments.isFirst())
                .last(enrollments.isLast())
                .build();
    }
}
