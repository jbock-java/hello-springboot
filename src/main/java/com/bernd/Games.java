package com.bernd;

import com.bernd.model.Game;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class Games {
  private final Map<String, Game> map = new LinkedHashMap<>();

  Game get(String id) {
    return map.get(id);
  }

  Game put(Game game) {
    map.put(game.id(), game);
    return game;
  }

  List<Game> games() {
    return List.copyOf(map.values());
  }
}
