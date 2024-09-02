package com.bernd;

import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

  private final MessageSendingOperations<String> operations;
  private final Users users;
  private final OpenGames openGames;

  SessionDisconnectEventListener(
      MessageSendingOperations<String> operations,
      Users users,
      OpenGames openGames) {
    this.operations = operations;
    this.users = users;
    this.openGames = openGames;
  }

  @Override
  public void onApplicationEvent(SessionDisconnectEvent event) {
    Principal user = event.getUser();
    if (user == null) {
      return;
    }
    String name = user.getName();
    users.logout(name);
    openGames.remove(name);
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
  }
}
