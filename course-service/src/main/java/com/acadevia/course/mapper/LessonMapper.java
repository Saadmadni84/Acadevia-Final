package com.acadevia.course.mapper;

import com.acadevia.course.dto.request.CreateLessonRequest;
import com.acadevia.course.dto.response.LessonDetailResponse;
import com.acadevia.course.dto.response.LessonResponse;
import com.acadevia.course.entity.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LessonMapper {

    @Mapping(target = "isCompleted", ignore = true)
    LessonResponse toResponse(Lesson lesson);

    @Mapping(target = "isCompleted", ignore = true)
    @Mapping(target = "progressInfo", ignore = true)
    LessonDetailResponse toDetailResponse(Lesson lesson);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Lesson toEntity(CreateLessonRequest request);
}
