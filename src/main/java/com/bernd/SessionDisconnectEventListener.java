package com.bernd;

import com.bernd.model.UserList;
import java.security.Principal;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private final Users users;
  private final OpenGames openGames;

  SessionDisconnectEventListener(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers,
      Users users,
      OpenGames openGames) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
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
    lobbyUsers.remove(name);
    users.logout(name);
    openGames.remove(name);
    operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
  }
}
