package com.acadevia.game.service.impl;

import com.acadevia.game.dto.response.GameDetailResponse;
import com.acadevia.game.dto.response.GameResponse;
import com.acadevia.game.dto.game.GameSearchCriteria;
import com.acadevia.game.dto.request.CreateGameRequest;
import com.acadevia.game.entity.Concept;
import com.acadevia.game.entity.Game;
import com.acadevia.game.exception.ResourceNotFoundException;
import com.acadevia.game.mapper.GameMapper;
import com.acadevia.game.repository.ConceptRepository;
import com.acadevia.game.repository.GameRepository;
import com.acadevia.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;
    private final ConceptRepository conceptRepository;
    private final GameMapper gameMapper;

    @Override
    @Transactional
    public GameResponse createGame(CreateGameRequest request) {
        Concept concept = conceptRepository.findById(request.getConceptId())
                .orElseThrow(() -> new ResourceNotFoundException("Concept not found with id: " + request.getConceptId()));
        Game game = gameMapper.toEntity(request, concept, concept.getChapter(), concept.getSubject());
        game.setCreatedAt(LocalDateTime.now());
        gameRepository.save(game);
        return gameMapper.toResponse(game);
    }

    @Override
    @Transactional
    public GameResponse updateGame(Long id, CreateGameRequest request) {
        Game existingGame = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        
        gameMapper.updateEntityFromRequest(request, existingGame);
        existingGame.setUpdatedAt(LocalDateTime.now());
        gameRepository.save(existingGame);
        return gameMapper.toResponse(existingGame);
    }

    @Override
    @Transactional(readOnly = true)
    public GameDetailResponse getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        return gameMapper.toDetailResponse(game);
    }

    @Override
    @Transactional
    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new ResourceNotFoundException("Game not found with id: " + id);
        }
        gameRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GameResponse> searchGames(GameSearchCriteria criteria, Pageable pageable) {
        // This would ideally use a Specification or QueryDSL
        // For simplicity, using repository method if available or basic search
        if (criteria.getQuery() != null && !criteria.getQuery().isEmpty()) {
             return gameRepository.searchGames(
                     criteria.getQuery(),
                     criteria.getType(),
                     null,
                     null,
                     criteria.getDifficulty(),
                     pageable)
                     .map(gameMapper::toResponse);
        }
        return gameRepository.findAll(pageable).map(gameMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameResponse> getGamesByConcept(Long conceptId) {
        return gameRepository.findByConceptIdAndIsActiveTrue(conceptId).stream()
                .map(gameMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameResponse> getTrendingGames() {
        return gameRepository.findTop10ByIsActiveTrueOrderByTotalPlaysDesc().stream()
                .map(gameMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameResponse> getNewReleases() {
        return gameRepository.findTop10ByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(gameMapper::toResponse)
                .collect(Collectors.toList());
    }
}
