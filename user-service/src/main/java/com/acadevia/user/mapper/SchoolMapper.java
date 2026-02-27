package com.acadevia.user.mapper;

import com.acadevia.user.dto.SchoolDto;
import com.acadevia.user.entity.School;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SchoolMapper {

    @Mapping(source = "state.id", target = "stateId")
    @Mapping(source = "state.name", target = "stateName")
    @Mapping(source = "city.id", target = "cityId")
    @Mapping(source = "city.name", target = "cityName")
    SchoolDto toDto(School school);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "classrooms", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "totalStudents", ignore = true)
    @Mapping(target = "totalTeachers", ignore = true)
    @Mapping(target = "totalClassrooms", ignore = true)
    @Mapping(target = "isVerified", ignore = true)
    School toEntity(SchoolDto schoolDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "state", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "code", ignore = true) // Code should not be updated
    @Mapping(target = "registeredBy", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(SchoolDto dto, @MappingTarget School entity);
}
