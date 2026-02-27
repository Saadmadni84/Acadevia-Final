package com.acadevia.game.mapper;

import com.acadevia.game.dto.request.CreateGameRequest;
import com.acadevia.game.dto.response.GameCardResponse;
import com.acadevia.game.dto.response.GameDetailResponse;
import com.acadevia.game.dto.response.GameResponse;
import com.acadevia.game.entity.Chapter;
import com.acadevia.game.entity.Concept;
import com.acadevia.game.entity.Game;
import com.acadevia.game.entity.Subject;
import com.acadevia.game.entity.enums.GameDifficulty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameMapper {

    private final ObjectMapper objectMapper;

    public Game toEntity(CreateGameRequest request, Concept concept, Chapter chapter, Subject subject) {
        Game game = new Game();
        game.setConcept(concept);
        game.setChapter(chapter);
        game.setSubject(subject);
        game.setClassGrade(subject.getCode().equals("SCI") ? 9 : chapter.getClassGrade()); // Defaulting but can override
        // Actually classGrade should likely come from chapter or concept primarily if consistent
        game.setClassGrade(concept.getClassGrade());

        game.setTitle(request.getTitle());
        game.setTitleLocal(request.getTitleLocal());
        game.setDescription(request.getDescription());
        game.setInstructions(request.getInstructions());
        game.setGameType(request.getGameType());
        game.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : GameDifficulty.MEDIUM);
        game.setLanguage(request.getLanguage() != null ? request.getLanguage() : "en");
        
        try {
            game.setGameData(objectMapper.writeValueAsString(request.getGameData()));
        } catch (JsonProcessingException e) {
            log.error("Error serializing game data", e);
            throw new RuntimeException("Invalid game data format");
        }

        game.setTimeLimitSec(request.getTimeLimitSec());
        game.setMinPlayers(request.getMinPlayers());
        game.setMaxPlayers(request.getMaxPlayers());
        game.setIsMultiplayer(request.getIsMultiplayer());
        
        game.setXpReward(request.getXpReward());
        game.setCreditReward(request.getCreditReward());
        
        game.setMaxScore(request.getMaxScore());
        game.setPassScore(request.getPassScore());
        
        game.setThumbnailUrl(request.getThumbnailUrl());
        game.setBackgroundUrl(request.getBackgroundUrl());
        
        game.setTags(request.getTags());
        game.setTopic(request.getTopic());
        game.setSchoolId(request.getSchoolId());
        
        return game;
    }

    public GameResponse toResponse(Game game) {
        GameResponse response = new GameResponse();
        mapCommonFields(game, response);
        return response;
    }

    public GameDetailResponse toDetailResponse(Game game) {
        GameDetailResponse response = new GameDetailResponse();
        mapCommonFields(game, response);
        
        try {
            response.setGameData(objectMapper.readValue(game.getGameData(), Object.class));
        } catch (JsonProcessingException e) {
            log.error("Error deserializing game data", e);
            response.setGameData(null);
        }
        
        response.setTags(game.getTags());
        response.setTopic(game.getTopic());
        response.setCreatedBy(game.getCreatedBy());
        response.setSchoolId(game.getSchoolId());
        
        return response;
    }

    public GameCardResponse toCardResponse(Game game) {
        GameCardResponse response = new GameCardResponse();
        response.setId(game.getId());
        response.setTitle(game.getTitle());
        response.setDescription(game.getDescription());
        response.setGameType(game.getGameType().name());
        response.setDifficulty(game.getDifficulty().name());
        response.setLanguage(game.getLanguage());
        response.setThumbnailUrl(game.getThumbnailUrl());
        
        response.setTimeLimitSec(game.getTimeLimitSec());
        response.setMaxScore(game.getMaxScore());
        
        response.setIsMultiplayer(game.getIsMultiplayer());
        response.setMinPlayers(game.getMinPlayers());
        response.setMaxPlayers(game.getMaxPlayers());
        
        response.setTotalPlays(game.getTotalPlays());
        response.setAvgScore(game.getAvgScore().doubleValue());
        
        response.setXpReward(game.getXpReward());
        response.setCreditReward(game.getCreditReward());
        
        response.setSubjectCode(game.getSubject().getCode());
        response.setSubjectName(game.getSubject().getName());
        response.setChapterTitle(game.getChapter().getTitle());
        response.setConceptTitle(game.getConcept().getTitle());
        response.setClassGrade(game.getClassGrade());
        
        response.setIsFeatured(game.getIsFeatured());
        
        return response;
    }

    private void mapCommonFields(Game game, GameResponse response) {
        response.setId(game.getId());
        response.setConceptId(game.getConcept().getId());
        response.setChapterId(game.getChapter().getId());
        response.setSubjectId(game.getSubject().getId());
        response.setClassGrade(game.getClassGrade());
        
        response.setTitle(game.getTitle());
        response.setTitleLocal(game.getTitleLocal());
        response.setDescription(game.getDescription());
        response.setInstructions(game.getInstructions());
        
        response.setGameType(game.getGameType());
        response.setDifficulty(game.getDifficulty());
        response.setLanguage(game.getLanguage());
        
        response.setTimeLimitSec(game.getTimeLimitSec());
        response.setMinPlayers(game.getMinPlayers());
        response.setMaxPlayers(game.getMaxPlayers());
        response.setIsMultiplayer(game.getIsMultiplayer());
        
        response.setXpReward(game.getXpReward());
        response.setCreditReward(game.getCreditReward());
        
        response.setMaxScore(game.getMaxScore());
        
        response.setThumbnailUrl(game.getThumbnailUrl());
        response.setBackgroundUrl(game.getBackgroundUrl());
        
        response.setTotalPlays(game.getTotalPlays());
        response.setAvgScore(game.getAvgScore());
        
        response.setIsFeatured(game.getIsFeatured());
        response.setIsActive(game.getIsActive());
        
        response.setCreatedAt(game.getCreatedAt());
        response.setUpdatedAt(game.getUpdatedAt());
    }

    public void updateEntityFromRequest(CreateGameRequest request, Game game) {
        if (request.getTitle() != null) game.setTitle(request.getTitle());
        if (request.getTitleLocal() != null) game.setTitleLocal(request.getTitleLocal());
        if (request.getDescription() != null) game.setDescription(request.getDescription());
        if (request.getInstructions() != null) game.setInstructions(request.getInstructions());
        if (request.getGameType() != null) game.setGameType(request.getGameType());
        if (request.getDifficulty() != null) game.setDifficulty(request.getDifficulty());
        if (request.getLanguage() != null) game.setLanguage(request.getLanguage());
        if (request.getTimeLimitSec() != null) game.setTimeLimitSec(request.getTimeLimitSec());
        if (request.getMinPlayers() != null) game.setMinPlayers(request.getMinPlayers());
        if (request.getMaxPlayers() != null) game.setMaxPlayers(request.getMaxPlayers());
        if (request.getIsMultiplayer() != null) game.setIsMultiplayer(request.getIsMultiplayer());
        if (request.getXpReward() != null) game.setXpReward(request.getXpReward());
        if (request.getCreditReward() != null) game.setCreditReward(request.getCreditReward());
        if (request.getMaxScore() != null) game.setMaxScore(request.getMaxScore());
        if (request.getPassScore() != null) game.setPassScore(request.getPassScore());
        if (request.getThumbnailUrl() != null) game.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getBackgroundUrl() != null) game.setBackgroundUrl(request.getBackgroundUrl());
        if (request.getTags() != null) game.setTags(request.getTags());
        if (request.getTopic() != null) game.setTopic(request.getTopic());
        if (request.getSchoolId() != null) game.setSchoolId(request.getSchoolId());
        if (request.getGameData() != null) {
            try {
                game.setGameData(objectMapper.writeValueAsString(request.getGameData()));
            } catch (JsonProcessingException e) {
                log.error("Error serializing game data", e);
                throw new RuntimeException("Invalid game data format");
            }
        }
    }
}
