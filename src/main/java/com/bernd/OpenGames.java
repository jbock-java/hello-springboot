package com.bernd;

import com.bernd.model.OpenGame;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class OpenGames {
  private final Map<String, OpenGame> map = new LinkedHashMap<>();

  OpenGame get(String id) {
    return map.get(id);
  }

  OpenGame put(String id, OpenGame game) {
    map.put(game.id(), game);
    return game;
  }

  List<OpenGame> games() {
    return List.copyOf(map.values());
  }
}
