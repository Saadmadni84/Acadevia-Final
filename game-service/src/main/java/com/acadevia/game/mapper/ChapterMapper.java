package com.acadevia.game.mapper;

import com.acadevia.game.dto.request.CreateChapterRequest;
import com.acadevia.game.dto.response.ChapterDetailResponse;
import com.acadevia.game.dto.response.ChapterResponse;
import com.acadevia.game.entity.Chapter;
import com.acadevia.game.entity.Subject;
import org.springframework.stereotype.Component;

@Component
public class ChapterMapper {

    public Chapter toEntity(CreateChapterRequest request, Subject subject) {
        Chapter chapter = new Chapter();
        chapter.setSubject(subject);
        chapter.setClassGrade(request.getClassGrade());
        chapter.setTitle(request.getTitle());
        chapter.setTitleLocal(request.getTitleLocal());
        chapter.setDescription(request.getDescription());
        chapter.setSequenceOrder(request.getSequenceOrder());
        chapter.setIconUrl(request.getIconUrl());
        return chapter;
    }

    public ChapterResponse toResponse(Chapter chapter) {
        ChapterResponse response = new ChapterResponse();
        response.setId(chapter.getId());
        response.setSubjectId(chapter.getSubject().getId());
        response.setClassGrade(chapter.getClassGrade());
        response.setTitle(chapter.getTitle());
        response.setTitleLocal(chapter.getTitleLocal());
        response.setDescription(chapter.getDescription());
        response.setSequenceOrder(chapter.getSequenceOrder());
        response.setTotalConcepts(chapter.getTotalConcepts());
        response.setTotalGames(chapter.getTotalGames());
        response.setIconUrl(chapter.getIconUrl());
        response.setIsActive(chapter.getIsActive());
        response.setCreatedAt(chapter.getCreatedAt());
        response.setUpdatedAt(chapter.getUpdatedAt());
        return response;
    }

    public ChapterDetailResponse toDetailResponse(Chapter chapter) {
        ChapterDetailResponse response = new ChapterDetailResponse();
        response.setId(chapter.getId());
        response.setSubjectId(chapter.getSubject().getId());
        response.setClassGrade(chapter.getClassGrade());
        response.setTitle(chapter.getTitle());
        response.setTitleLocal(chapter.getTitleLocal());
        response.setDescription(chapter.getDescription());
        response.setSequenceOrder(chapter.getSequenceOrder());
        response.setTotalConcepts(chapter.getTotalConcepts());
        response.setTotalGames(chapter.getTotalGames());
        response.setIconUrl(chapter.getIconUrl());
        response.setIsActive(chapter.getIsActive());
        response.setCreatedAt(chapter.getCreatedAt());
        response.setUpdatedAt(chapter.getUpdatedAt());
        return response;
    }
}
