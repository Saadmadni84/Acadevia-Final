package com.acadevia.user.mapper;

import com.acadevia.user.dto.StudentMappingDto;
import com.acadevia.user.entity.StudentClassroomMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StudentMappingMapper {

    @Mapping(source = "school.id", target = "schoolId")
    @Mapping(source = "school.name", target = "schoolName")
    @Mapping(source = "classroom.id", target = "classroomId")
    @Mapping(expression = "java(mapping.getClassroom() != null ? mapping.getClassroom().getClassGrade() + \"-\" + mapping.getClassroom().getSection() : \"\")", target = "classroomInfo")
    StudentMappingDto toDto(StudentClassroomMapping mapping);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "school", ignore = true)
    @Mapping(target = "classroom", ignore = true)
    @Mapping(target = "enrolledAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StudentClassroomMapping toEntity(StudentMappingDto dto);
}
