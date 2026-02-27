package com.acadevia.user.mapper;

import com.acadevia.user.dto.CityDto;
import com.acadevia.user.entity.City;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CityMapper {

    @Mapping(source = "state.id", target = "stateId")
    @Mapping(source = "state.name", target = "stateName")
    CityDto toDto(City city);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "state", ignore = true) // Set manually in service
    @Mapping(target = "schools", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    City toEntity(CityDto cityDto);
}
