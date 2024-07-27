package com.bernd;

import com.bernd.model.OpenGame;
import com.bernd.model.OpenGameList;
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

  OpenGame put(OpenGame game) {
    map.put(game.id(), game);
    return game;
  }

  OpenGameList games() {
    return new OpenGameList(List.copyOf(map.values()));
  }
}
