package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import com.bernd.model.User;
import com.bernd.model.UserList;
import com.bernd.util.RandomString;
import java.security.Principal;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private final Games games;
  private User lookingForMatch;

  LobbyController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers,
      Games games) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
    this.games = games;
  }

  @MessageMapping("/lobby/hello")
  public void lobbyJoinedAction(Principal principal) {
    lobbyUsers.add(principal);
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
  }

  @MessageMapping("/lobby/match")
  public void matchAction(MatchRequest message, Principal principal) {
    User user = lobbyUsers.get(principal);
    if (lookingForMatch == null) {
      lookingForMatch = user;
      operations.convertAndSend("/topic/lobby/gamerequest",
          new Status(message.name(), "ready"));
      return;
    }
    lobbyUsers.remove(principal.getName());
    lobbyUsers.remove(lookingForMatch.name());
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
    String gameId = RandomString.get();
    Game game = games.put(new Game(gameId, user, lookingForMatch, false, user.name(), false, new int[][]{
        new int[9],
        new int[9],
        new int[9],
        new int[9],
        new int[9],
        new int[9],
        new int[9],
        new int[9],
        new int[9]
    }));
    operations.convertAndSend("/topic/lobby/gamestart", game);
    lookingForMatch = null;
  }
}
