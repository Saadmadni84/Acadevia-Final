package com.acadevia.game.engine;

import com.acadevia.game.entity.enums.GameType;
import org.springframework.stereotype.Service;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class GameEngineProvider {

    private final Map<GameType, GameEngine> engines;

    public GameEngineProvider(List<GameEngine> engineList) {
        engines = new EnumMap<>(GameType.class);
        for (GameEngine engine : engineList) {
            for (GameType type : GameType.values()) {
                if (engine.supports(type.name())) {
                    engines.put(type, engine);
                }
            }
        }
    }
    
    public GameEngine getEngine(GameType type) {
        GameEngine engine = engines.get(type);
         if (engine == null) {
            // For now, return a default mock engine or throw
             // In a real app, throw new UnsupportedGameTypeException
             return null; 
        }
        return engine;
    }
    
    public void register(GameType type, GameEngine engine) {
        engines.put(type, engine);
    }
}
