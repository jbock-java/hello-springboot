package com.bernd;

import com.bernd.model.*;
import com.bernd.util.RandomString;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
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
  public void lobbyJoinedAction(JoinLobbyRequest request, Principal principal) {
    lobbyUsers.add(principal, request.name());
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
  }

  @MessageMapping("/lobby/match")
  public void matchAction(MatchRequest message, Principal principal) {
    User user = lobbyUsers.get(principal);
    if (lookingForMatch == null) {
      lookingForMatch = user;
      operations.convertAndSend("/topic/lobby/gamerequest",
          new Status(message.id(), "ready"));
      return;
    }
    lobbyUsers.remove(principal.getName());
    lobbyUsers.remove(Integer.toString(lookingForMatch.id()));
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
    String gameId = RandomString.get();
    Game game = games.add(new Game(gameId, user, lookingForMatch, user.id(), List.of(
        "", "", "",
        "", "", "",
        "", "", ""
    )));
    operations.convertAndSend("/topic/lobby/gamestart", game);
    lookingForMatch = null;
  }
}
