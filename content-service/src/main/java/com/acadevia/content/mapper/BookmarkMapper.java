package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.BookmarkCreateRequest;
import com.acadevia.content.dto.response.BookmarkResponse;
import com.acadevia.content.entity.VideoBookmark;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookmarkMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VideoBookmark toEntity(BookmarkCreateRequest request);

    BookmarkResponse toResponse(VideoBookmark bookmark);

    List<BookmarkResponse> toResponseList(List<VideoBookmark> bookmarks);
}
