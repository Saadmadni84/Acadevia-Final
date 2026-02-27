package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.PopQuestionCreateRequest;
import com.acadevia.content.dto.response.PopQuestionResponse;
import com.acadevia.content.entity.VideoPopQuestion;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PopQuestionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "video", ignore = true)
    @Mapping(target = "videoId", ignore = true)
    @Mapping(target = "totalAttempts", constant = "0")
    @Mapping(target = "correctCount", constant = "0")
    @Mapping(target = "accuracyPct", constant = "0.0")
    @Mapping(target = "avgTimeSec", constant = "0.0")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "questionType", expression = "java(com.acadevia.content.entity.enums.QuestionType.valueOf(request.getQuestionType()))")
    @Mapping(target = "difficulty", expression = "java(com.acadevia.content.entity.enums.Difficulty.valueOf(request.getDifficulty()))")
    VideoPopQuestion toEntity(PopQuestionCreateRequest request);

    @Mapping(target = "questionType", expression = "java(question.getQuestionType() != null ? question.getQuestionType().name() : null)")
    @Mapping(target = "difficulty", expression = "java(question.getDifficulty() != null ? question.getDifficulty().name() : null)")
    @Mapping(target = "correctAttempts", source = "correctCount")
    @Mapping(target = "accuracyRate", source = "accuracyPct")
    @Mapping(target = "avgTimeTakenSec", source = "avgTimeSec")
    PopQuestionResponse toResponse(VideoPopQuestion question);

    List<PopQuestionResponse> toResponseList(List<VideoPopQuestion> questions);
}
