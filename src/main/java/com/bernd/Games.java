package com.bernd;

import com.bernd.model.Game;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class Games {
  private final Map<String, Game> map = new LinkedHashMap<>();

  Game update(Game game) {
    Game g = map.get(game.id()).update(game);
    return add(g);
  }

  Game get(String id) {
    return map.get(id);
  }

  Game add(Game game) {
    map.put(game.id(), game);
    return game;
  }

  List<Game> games() {
    return List.copyOf(map.values());
  }
}
