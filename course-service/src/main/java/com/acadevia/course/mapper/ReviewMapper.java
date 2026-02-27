package com.acadevia.course.mapper;

import com.acadevia.course.dto.response.ReviewResponse;
import com.acadevia.course.entity.CourseReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReviewMapper {

    @Mapping(target = "userName", ignore = true) // Would need user-service call
    @Mapping(target = "userAvatar", ignore = true) // Would need user-service call
    ReviewResponse toResponse(CourseReview review);
}
