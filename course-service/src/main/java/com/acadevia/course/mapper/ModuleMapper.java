package com.acadevia.course.mapper;

import com.acadevia.course.dto.request.CreateModuleRequest;
import com.acadevia.course.dto.response.ModuleDetailResponse;
import com.acadevia.course.dto.response.ModuleResponse;
import com.acadevia.course.entity.Module;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ModuleMapper {

    ModuleResponse toResponse(Module module);

    @Mapping(target = "lessons", ignore = true) // Handled in service
    @Mapping(target = "moduleProgress", ignore = true)
    ModuleDetailResponse toDetailResponse(Module module);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "totalLessons", constant = "0")
    @Mapping(target = "totalDurationMin", constant = "0")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lessons", ignore = true)
    Module toEntity(CreateModuleRequest request);
}
