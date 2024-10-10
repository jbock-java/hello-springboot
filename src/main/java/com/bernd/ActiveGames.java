package com.bernd;

import com.bernd.model.ActiveGame;
import com.bernd.model.Game;
import com.bernd.model.StatusMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class ActiveGames {

  private final StatusMap statusMap;
  private final Games games;

  ActiveGames(
      StatusMap statusMap,
      Games games) {
    this.statusMap = statusMap;
    this.games = games;
  }

  List<ActiveGame> games() {
    Set<String> active = statusMap.activeGames();
    List<ActiveGame> result = new ArrayList<>(active.size());
    for (String gameId : active) {
      Game game = games.get(gameId);
      if (game == null) {
        continue;
      }
      result.add(game.toActiveGame());
    }
    return result;
  }
}
