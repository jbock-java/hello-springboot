package com.bernd;

import com.bernd.model.ActiveGame;
import com.bernd.model.ActiveGameList;
import com.bernd.model.StatusMap;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class ActiveGames {

  private final StatusMap statusMap;
  private final Map<String, ActiveGame> map = new LinkedHashMap<>();

  ActiveGames(StatusMap statusMap) {
    this.statusMap = statusMap;
  }

  ActiveGame put(ActiveGame game) {
    map.put(game.id(), game);
    return game;
  }

  ActiveGameList games() {
    Set<String> active = statusMap.activeGames();
    List<ActiveGame> result = new ArrayList<>(active.size());
    for (String gameId : active) {
      ActiveGame game = map.get(gameId);
      if (game != null) {
        result.add(game);
      }
    }
    return new ActiveGameList(result);
  }
}
