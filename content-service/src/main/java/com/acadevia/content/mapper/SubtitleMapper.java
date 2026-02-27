package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.SubtitleCreateRequest;
import com.acadevia.content.dto.response.SubtitleResponse;
import com.acadevia.content.entity.VideoSubtitle;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SubtitleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "video", ignore = true)
    @Mapping(target = "videoId", ignore = true)
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "verifiedBy", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "subtitleFormat", expression = "java(com.acadevia.content.entity.enums.SubtitleFormat.valueOf(request.getFormat()))")
    VideoSubtitle toEntity(SubtitleCreateRequest request);

    @Mapping(target = "format", expression = "java(subtitle.getSubtitleFormat() != null ? subtitle.getSubtitleFormat().name() : null)")
    SubtitleResponse toResponse(VideoSubtitle subtitle);

    List<SubtitleResponse> toResponseList(List<VideoSubtitle> subtitles);
}
