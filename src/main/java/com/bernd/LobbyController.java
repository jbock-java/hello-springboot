package com.bernd;

import com.bernd.model.*;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private User lookingForMatch;

  LobbyController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
  }

  @MessageMapping("/lobby/hello")
  public void lobbyJoinedAction(LobbyJoinRequest request, Principal principal) {
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
    operations.convertAndSend("/topic/lobby/gamestart",
        new Game("123", user, lookingForMatch, user.id(), List.of(
          "", "", "",
          "", "", "",
          "", "", ""
        )));
    lookingForMatch = null;
  }
}
