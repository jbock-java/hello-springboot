package com.bernd;

import com.bernd.model.JoinRequest;
import com.bernd.model.JoinResponse;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class JoinController {

  private final MessageSendingOperations<String> operations;

  private final LobbyUsers lobbyUsers;

  JoinController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
  }

  @MessageMapping("/join")
  public void joinAction(JoinRequest request, Principal principal) {
    lobbyUsers.add(principal, request.name());
    String channel = request.channel();
    operations.convertAndSend("/topic/join/" + channel,
        new JoinResponse(request.name(), Integer.parseInt(principal.getName())));
  }
}