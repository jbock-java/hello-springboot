package com.bernd;

import com.bernd.model.User;
import com.bernd.model.UsersResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final SimpUserRegistry simpUserRegistry;
  private final UserNames userNames;

  @Autowired
  public LobbyController(
      MessageSendingOperations<String> operations,
      SimpUserRegistry simpUserRegistry,
      UserNames userNames) {
    this.simpUserRegistry = simpUserRegistry;
    this.operations = operations;
    this.userNames = userNames;
  }

  @MessageMapping("/lobby/hello")
  public void lobbyJoinedAction() {
    List<User> users = simpUserRegistry
        .getUsers()
        .stream()
        .map(u -> new User(Integer.parseInt(u.getName()), userNames.getName(u.getPrincipal())))
        .toList();
    operations.convertAndSend("/topic/lobby/users",
        new UsersResponse(users));
  }
}
