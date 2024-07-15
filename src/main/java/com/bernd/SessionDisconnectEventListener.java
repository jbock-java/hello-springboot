package com.bernd;

import com.bernd.model.UserList;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;

  SessionDisconnectEventListener(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
  }

  @Override
  public void onApplicationEvent(SessionDisconnectEvent event) {
    String name = event.getUser().getName();
    lobbyUsers.remove(name);
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
  }
}