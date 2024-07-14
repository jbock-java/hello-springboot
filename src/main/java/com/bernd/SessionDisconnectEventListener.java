package com.bernd;

import com.bernd.model.User;
import com.bernd.model.UserList;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Objects;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

  private final MessageSendingOperations<String> operations;
  private final SimpUserRegistry simpUserRegistry;
  private final Users users;

  SessionDisconnectEventListener(
      MessageSendingOperations<String> operations,
      SimpUserRegistry simpUserRegistry,
      Users users) {
    this.operations = operations;
    this.simpUserRegistry = simpUserRegistry;
    this.users = users;
  }

  @Override
  public void onApplicationEvent(SessionDisconnectEvent event) {
    String name = event.getUser().getName();
    List<User> users = simpUserRegistry
        .getUsers()
        .stream()
        .filter(u -> !Objects.equals(u.getName(), name))
        .map(u -> this.users.get(u.getPrincipal()))
        .filter(Objects::nonNull)
        .toList();
    operations.convertAndSend("/topic/lobby/users",
        new UserList(users));
  }
}