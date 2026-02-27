package com.acadevia.game.mapper;

import com.acadevia.game.dto.request.CreateConceptRequest;
import com.acadevia.game.dto.response.ConceptDetailResponse;
import com.acadevia.game.dto.response.ConceptResponse;
import com.acadevia.game.entity.Chapter;
import com.acadevia.game.entity.Concept;
import com.acadevia.game.entity.Subject;
import com.acadevia.game.entity.enums.GameDifficulty;
import org.springframework.stereotype.Component;

@Component
public class ConceptMapper {

    public Concept toEntity(CreateConceptRequest request, Chapter chapter, Subject subject) {
        Concept concept = new Concept();
        concept.setChapter(chapter);
        concept.setSubject(subject);
        concept.setClassGrade(chapter.getClassGrade());
        concept.setTitle(request.getTitle());
        concept.setTitleLocal(request.getTitleLocal());
        concept.setDescription(request.getDescription());
        concept.setKeyPoints(request.getKeyPoints());
        concept.setFormulas(request.getFormulas());
        concept.setDefinitions(request.getDefinitions());
        concept.setExamples(request.getExamples());
        concept.setSequenceOrder(request.getSequenceOrder());
        concept.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : GameDifficulty.MEDIUM);
        concept.setIconUrl(request.getIconUrl());
        return concept;
    }

    public ConceptResponse toResponse(Concept concept) {
        ConceptResponse response = new ConceptResponse();
        response.setId(concept.getId());
        response.setChapterId(concept.getChapter().getId());
        response.setSubjectId(concept.getSubject().getId());
        response.setClassGrade(concept.getClassGrade());
        response.setTitle(concept.getTitle());
        response.setTitleLocal(concept.getTitleLocal());
        response.setDescription(concept.getDescription());
        response.setSequenceOrder(concept.getSequenceOrder());
        response.setDifficulty(concept.getDifficulty());
        response.setTotalGames(concept.getTotalGames());
        response.setIconUrl(concept.getIconUrl());
        response.setIsActive(concept.getIsActive());
        response.setCreatedAt(concept.getCreatedAt());
        response.setUpdatedAt(concept.getUpdatedAt());
        return response;
    }

    public ConceptDetailResponse toDetailResponse(Concept concept) {
        ConceptDetailResponse response = new ConceptDetailResponse();
        response.setId(concept.getId());
        response.setChapterId(concept.getChapter().getId());
        response.setSubjectId(concept.getSubject().getId());
        response.setClassGrade(concept.getClassGrade());
        response.setTitle(concept.getTitle());
        response.setTitleLocal(concept.getTitleLocal());
        response.setDescription(concept.getDescription());
        response.setSequenceOrder(concept.getSequenceOrder());
        response.setDifficulty(concept.getDifficulty());
        response.setTotalGames(concept.getTotalGames());
        response.setIconUrl(concept.getIconUrl());
        response.setIsActive(concept.getIsActive());
        response.setKeyPoints(concept.getKeyPoints());
        response.setFormulas(concept.getFormulas());
        response.setDefinitions(concept.getDefinitions());
        response.setExamples(concept.getExamples());
        response.setCreatedAt(concept.getCreatedAt());
        response.setUpdatedAt(concept.getUpdatedAt());
        return response;
    }
}
