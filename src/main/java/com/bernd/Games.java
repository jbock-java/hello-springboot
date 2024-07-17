package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.Move;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class Games {
  private final Map<String, Game> map = new LinkedHashMap<>();

  Game update(Move move) {
    Game g = map.get(move.id()).update(move);
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
