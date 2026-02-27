package com.acadevia.course.mapper;

import com.acadevia.course.dto.response.EnrollmentResponse;
import com.acadevia.course.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EnrollmentMapper {

    @Mapping(target = "courseTitle", source = "course.title")
    @Mapping(target = "courseThumbnail", source = "course.thumbnailUrl")
    @Mapping(target = "courseSubject", source = "course.subject")
    @Mapping(target = "courseClassGrade", source = "course.classGrade")
    @Mapping(target = "lastLessonTitle", ignore = true) // Would need to fetch lesson
    EnrollmentResponse toResponse(Enrollment enrollment);
}
