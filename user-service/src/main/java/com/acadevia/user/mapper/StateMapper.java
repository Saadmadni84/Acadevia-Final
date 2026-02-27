package com.acadevia.user.mapper;

import com.acadevia.user.dto.StateDto;
import com.acadevia.user.entity.State;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StateMapper {
    StateDto toDto(State state);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cities", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    State toEntity(StateDto stateDto);
}
