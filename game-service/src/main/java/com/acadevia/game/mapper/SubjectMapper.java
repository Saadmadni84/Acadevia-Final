package com.acadevia.game.mapper;

import com.acadevia.game.dto.request.CreateSubjectRequest;
import com.acadevia.game.dto.response.SubjectResponse;
import com.acadevia.game.entity.Subject;
import org.springframework.stereotype.Component;

@Component
public class SubjectMapper {

    public Subject toEntity(CreateSubjectRequest request) {
        Subject subject = new Subject();
        subject.setName(request.getName());
        subject.setNameLocal(request.getNameLocal());
        subject.setCode(request.getCode());
        subject.setDescription(request.getDescription());
        subject.setIconUrl(request.getIconUrl());
        subject.setColorCode(request.getColorCode());
        subject.setBoard(request.getBoard() != null ? request.getBoard() : "ALL");
        subject.setDisplayOrder(request.getDisplayOrder());
        return subject;
    }

    public SubjectResponse toResponse(Subject subject) {
        SubjectResponse response = new SubjectResponse();
        response.setId(subject.getId());
        response.setName(subject.getName());
        response.setNameLocal(subject.getNameLocal());
        response.setCode(subject.getCode());
        response.setDescription(subject.getDescription());
        response.setIconUrl(subject.getIconUrl());
        response.setColorCode(subject.getColorCode());
        response.setBoard(subject.getBoard());
        response.setDisplayOrder(subject.getDisplayOrder());
        response.setIsActive(subject.getIsActive());
        response.setCreatedAt(subject.getCreatedAt());
        response.setUpdatedAt(subject.getUpdatedAt());
        return response;
    }
}
