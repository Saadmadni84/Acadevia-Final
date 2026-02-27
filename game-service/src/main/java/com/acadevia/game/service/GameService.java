package com.acadevia.game.service;

import com.acadevia.game.dto.response.GameDetailResponse;
import com.acadevia.game.dto.response.GameResponse;
import com.acadevia.game.dto.request.CreateGameRequest;
import com.acadevia.game.dto.game.GameSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GameService {

    GameResponse createGame(CreateGameRequest request);

    GameResponse updateGame(Long id, CreateGameRequest request);

    GameDetailResponse getGameById(Long id);

    void deleteGame(Long id);

    Page<GameResponse> searchGames(GameSearchCriteria criteria, Pageable pageable);

    List<GameResponse> getGamesByConcept(Long conceptId);

    List<GameResponse> getTrendingGames();

    List<GameResponse> getNewReleases();
}
