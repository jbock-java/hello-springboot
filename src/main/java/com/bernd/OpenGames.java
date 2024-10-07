package com.bernd;

import com.bernd.model.AcceptRequest;
import com.bernd.model.OpenGame;
import com.bernd.model.OpenGameList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class OpenGames {
  private final Map<String, OpenGame> map = new LinkedHashMap<>();

  OpenGame put(OpenGame game) {
    map.put(game.user(), game);
    return game;
  }

  OpenGame addRequest(String name, AcceptRequest request, String opponent) {
    OpenGame openGame = map.get(name);
    if (openGame == null) {
      return null;
    }
    OpenGame result = openGame.addRequest(request, opponent);
    map.put(name, result);
    return result;
  }

  OpenGameList games() {
    return new OpenGameList(List.copyOf(map.values()));
  }

  OpenGame remove(String name) {
    return map.remove(name);
  }

  List<AcceptRequest> getRequests(String name) {
    OpenGame openGame = map.get(name);
    if (openGame == null) {
      return List.of();
    }
    return openGame.requests();
  }
}
