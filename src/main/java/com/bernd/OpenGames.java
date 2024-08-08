package com.bernd;

import com.bernd.model.OpenGame;
import com.bernd.model.OpenGameList;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class OpenGames {
  private final Map<String, OpenGame> map = new LinkedHashMap<>();

  OpenGame put(OpenGame game) {
    map.put(game.user(), game);
    return game;
  }

  OpenGameList games() {
    return new OpenGameList(List.copyOf(map.values()));
  }

  OpenGame remove(String name) {
    return map.remove(name);
  }
}
