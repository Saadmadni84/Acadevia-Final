package com.acadevia.user.mapper;

import com.acadevia.user.dto.TeacherMappingDto;
import com.acadevia.user.entity.TeacherSchoolMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TeacherMappingMapper {

    @Mapping(source = "school.id", target = "schoolId")
    @Mapping(source = "school.name", target = "schoolName")
    TeacherMappingDto toDto(TeacherSchoolMapping mapping);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TeacherSchoolMapping toEntity(TeacherMappingDto dto);
}
