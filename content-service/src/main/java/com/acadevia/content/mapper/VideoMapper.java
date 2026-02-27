package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.response.VideoResponse;
import com.acadevia.content.dto.response.VideoDetailResponse;
import com.acadevia.content.dto.response.VideoSummaryResponse;
import com.acadevia.content.entity.ChapterMarker;
import com.acadevia.content.entity.Video;
import com.acadevia.content.entity.enums.VideoQuality;
import com.acadevia.content.util.VideoUtils;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VideoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalViews", constant = "0")
    @Mapping(target = "uniqueViewers", constant = "0")
    @Mapping(target = "avgWatchPct", constant = "0.0")
    @Mapping(target = "totalWatchTimeSec", constant = "0L")
    @Mapping(target = "totalPopQuestions", constant = "0")
    @Mapping(target = "avgPopAccuracy", constant = "0.0")
    @Mapping(target = "totalDownloads", constant = "0")
    @Mapping(target = "totalBookmarks", constant = "0")
    @Mapping(target = "totalNotes", constant = "0")
    @Mapping(target = "likeCount", constant = "0")
    @Mapping(target = "dislikeCount", constant = "0")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "isProcessing", constant = "false")
    @Mapping(target = "processingStatus", constant = "PENDING")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "popQuestions", ignore = true)
    @Mapping(target = "subtitles", ignore = true)
    @Mapping(target = "chapterMarkers", source = "chapterMarkers", qualifiedByName = "mapChapterMarkers")
    @Mapping(target = "minQuality", expression = "java(mapQuality(request.getMinQuality()))")
    @Mapping(target = "defaultQuality", expression = "java(mapQuality(request.getDefaultQuality()))")
    Video toEntity(VideoCreateRequest request);

    @Mapping(target = "availableQualities", expression = "java(com.acadevia.content.util.VideoUtils.getAvailableQualities(video))")
    @Mapping(target = "chapterMarkers", source = "chapterMarkers", qualifiedByName = "mapChapterMarkerResponses")
    @Mapping(target = "subtitles", ignore = true)
    @Mapping(target = "minQuality", expression = "java(video.getMinQuality() != null ? video.getMinQuality().name() : null)")
    @Mapping(target = "defaultQuality", expression = "java(video.getDefaultQuality() != null ? video.getDefaultQuality().name() : null)")
    @Mapping(target = "publishedAt", source = "createdAt")
    VideoResponse toResponse(Video video);

    @Mapping(target = "availableQualities", expression = "java(com.acadevia.content.util.VideoUtils.getAvailableQualities(video))")
    @Mapping(target = "chapterMarkers", source = "chapterMarkers", qualifiedByName = "mapChapterMarkerResponses")
    @Mapping(target = "subtitles", ignore = true)
    @Mapping(target = "popQuestions", ignore = true)
    @Mapping(target = "userProgress", ignore = true)
    @Mapping(target = "minQuality", expression = "java(video.getMinQuality() != null ? video.getMinQuality().name() : null)")
    @Mapping(target = "defaultQuality", expression = "java(video.getDefaultQuality() != null ? video.getDefaultQuality().name() : null)")
    @Mapping(target = "publishedAt", source = "createdAt")
    VideoDetailResponse toDetailResponse(Video video);

    VideoSummaryResponse toSummaryResponse(Video video);

    List<VideoResponse> toResponseList(List<Video> videos);

    List<VideoSummaryResponse> toSummaryResponseList(List<Video> videos);

    @Named("mapChapterMarkers")
    default List<ChapterMarker> mapChapterMarkers(List<VideoCreateRequest.ChapterMarkerRequest> requests) {
        if (requests == null) return null;
        return requests.stream()
                .map(r -> new ChapterMarker(r.getTimestamp(), r.getTitle()))
                .toList();
    }

    @Named("mapChapterMarkerResponses")
    default List<VideoResponse.ChapterMarkerResponse> mapChapterMarkerResponses(List<ChapterMarker> markers) {
        if (markers == null) return null;
        return markers.stream()
                .map(m -> VideoResponse.ChapterMarkerResponse.builder()
                        .timestamp(m.getTimestamp())
                        .title(m.getTitle())
                        .build())
                .toList();
    }

    default VideoQuality mapQuality(String quality) {
        return VideoUtils.parseQuality(quality);
    }
}
