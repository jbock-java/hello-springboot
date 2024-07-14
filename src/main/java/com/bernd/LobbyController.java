package com.bernd;

import com.bernd.model.User;
import com.bernd.model.UserList;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final SimpUserRegistry simpUserRegistry;
  private final Users users;

  LobbyController(
      MessageSendingOperations<String> operations,
      SimpUserRegistry simpUserRegistry,
      Users users) {
    this.simpUserRegistry = simpUserRegistry;
    this.operations = operations;
    this.users = users;
  }

  @MessageMapping("/lobby/hello")
  public void lobbyJoinedAction() {
    List<User> users = simpUserRegistry
        .getUsers()
        .stream()
        .map(u -> this.users.get(u.getPrincipal()))
        .filter(Objects::nonNull)
        .toList();
    operations.convertAndSend("/topic/lobby/users",
        new UserList(users));
  }
}