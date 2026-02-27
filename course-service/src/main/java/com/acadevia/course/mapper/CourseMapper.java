package com.acadevia.course.mapper;

import com.acadevia.course.dto.request.CreateCourseRequest;
import com.acadevia.course.dto.request.UpdateCourseRequest;
import com.acadevia.course.dto.response.*;
import com.acadevia.course.entity.Course;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CourseMapper {

    @Mapping(target = "isFavorited", ignore = true)
    @Mapping(target = "isEnrolled", ignore = true)
    @Mapping(target = "enrollmentProgress", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    CourseCardResponse toCardResponse(Course course);

    @Mapping(target = "isFavorited", ignore = true)
    @Mapping(target = "isEnrolled", ignore = true)
    @Mapping(target = "enrollmentProgress", ignore = true)
    @Mapping(target = "teacherName", ignore = true)
    @Mapping(target = "modules", ignore = true) // Handled in service to include lessons
    @Mapping(target = "reviewSummary", ignore = true)
    @Mapping(target = "enrollmentInfo", ignore = true)
    CourseDetailResponse toDetailResponse(Course course);

    CourseResponse toResponse(Course course);

    CourseSummaryResponse toSummaryResponse(Course course);

    @Mapping(target = "studentsEnrolled", source = "totalEnrolled")
    @Mapping(target = "rating", source = "avgRating")
    @Mapping(target = "progressPercentage", ignore = true)
    PopularCourseResponse toPopularResponse(Course course);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "schoolId", ignore = true)
    @Mapping(target = "totalEnrolled", constant = "0")
    @Mapping(target = "totalModules", constant = "0")
    @Mapping(target = "totalLessons", constant = "0")
    @Mapping(target = "totalDurationMin", constant = "0")
    @Mapping(target = "avgRating", constant = "0.0")
    @Mapping(target = "totalRatings", constant = "0")
    @Mapping(target = "totalReviews", constant = "0")
    @Mapping(target = "totalCompletions", constant = "0")
    @Mapping(target = "completionRate", constant = "0.0")
    @Mapping(target = "isFeatured", constant = "false")
    @Mapping(target = "featuredOrder", constant = "0")
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "modules", ignore = true)
    Course toEntity(CreateCourseRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teacherId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "totalEnrolled", ignore = true)
    @Mapping(target = "totalModules", ignore = true)
    @Mapping(target = "totalLessons", ignore = true)
    @Mapping(target = "totalDurationMin", ignore = true)
    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "totalRatings", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "totalCompletions", ignore = true)
    @Mapping(target = "completionRate", ignore = true)
    @Mapping(target = "isFeatured", ignore = true)
    @Mapping(target = "featuredOrder", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "modules", ignore = true)
    void updateEntity(@MappingTarget Course course, UpdateCourseRequest request);
}
