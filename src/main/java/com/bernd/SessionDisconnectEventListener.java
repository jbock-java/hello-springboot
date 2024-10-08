package com.bernd;

import com.bernd.util.RoomManager;
import java.security.Principal;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

  private final MessageSendingOperations<String> operations;
  private final RoomManager roomManager;
  private final OpenGames openGames;

  SessionDisconnectEventListener(
      MessageSendingOperations<String> operations,
      RoomManager roomManager,
      OpenGames openGames) {
    this.operations = operations;
    this.roomManager = roomManager;
    this.openGames = openGames;
  }

  @Override
  public void onApplicationEvent(SessionDisconnectEvent event) {
    Principal user = event.getUser();
    if (user == null) {
      return;
    }
    String name = user.getName();
    roomManager.logout(name);
    openGames.remove(name);
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
  }
}
