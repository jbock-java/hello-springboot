package com.bernd;

import com.bernd.model.ActiveGame;
import com.bernd.model.ActiveGameList;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ActiveGames {
  private final Map<String, ActiveGame> map = new LinkedHashMap<>();

  ActiveGame put(ActiveGame game) {
    map.put(game.id(), game);
    return game;
  }

  ActiveGameList games() {
    return new ActiveGameList(List.copyOf(map.values()));
  }

  ActiveGame remove(String name) {
    return map.remove(name);
  }
}
