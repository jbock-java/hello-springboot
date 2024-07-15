package com.bernd;

import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import com.bernd.model.User;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class MatchController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private User lookingForMatch;

  MatchController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
  }

  @MessageMapping("/match")
  public void matchAction(MatchRequest message, Principal principal) {
    User user = lobbyUsers.get(principal);
    if (lookingForMatch == null) {
      lookingForMatch = user;
      return;
    }
    operations.convertAndSend("/topic/lobby/gamestart",
        new Status(message.id(), "ready"));
    lookingForMatch = null;
  }
}