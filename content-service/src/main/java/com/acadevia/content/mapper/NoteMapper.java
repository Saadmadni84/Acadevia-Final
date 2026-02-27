package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.NoteCreateRequest;
import com.acadevia.content.dto.response.NoteResponse;
import com.acadevia.content.entity.VideoNote;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NoteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VideoNote toEntity(NoteCreateRequest request);

    NoteResponse toResponse(VideoNote note);

    List<NoteResponse> toResponseList(List<VideoNote> notes);
}
