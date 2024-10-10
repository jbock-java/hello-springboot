package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.OpenGame;
import com.bernd.model.StatusMap;
import com.bernd.util.Sender;
import java.util.List;
import java.util.Map;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupController {

  private final Sender sender;
  private final StatusMap statusMap;
  private final OpenGames openGames;
  private final Games games;

  CleanupController(
      Sender sender,
      StatusMap statusMap,
      OpenGames openGames,
      Games games) {
    this.sender = sender;
    this.statusMap = statusMap;
    this.openGames = openGames;
    this.games = games;
  }

  @Scheduled(fixedDelay = 40 * 1000)
  public void runScheduled() {
    Map<String, List<String>> updatedRooms = statusMap.removeInactiveUsers();
    for (Map.Entry<String, List<String>> e : updatedRooms.entrySet()) {
      String room = e.getKey();
      List<String> users = e.getValue();
      sender.sendUsers(room, users);
    }
    List<Game> games = this.games.games();
    for (Game game : games) {
      if (updatedRooms.getOrDefault(game.id(), List.of()).isEmpty()) {
        this.games.remove(game.id());
      }
    }
    List<OpenGame> openGames = this.openGames.games();
    for (OpenGame game : openGames) {
      if (!statusMap.contains(game.user())) {
        this.openGames.remove(game.user());
      }
    }
  }
}
