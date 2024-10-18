package com.bernd;

import com.bernd.model.StatusMap;
import com.bernd.util.RoomManager;
import java.security.Principal;
import java.util.Map;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SessionDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

    private final MessageSendingOperations<String> operations;
    private final RoomManager roomManager;
    private final StatusMap statusMap;

    SessionDisconnectEventListener(
            MessageSendingOperations<String> operations,
            RoomManager roomManager,
            StatusMap statusMap) {
        this.operations = operations;
        this.roomManager = roomManager;
        this.statusMap = statusMap;
    }

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        Principal user = event.getUser();
        if (user == null) {
            return;
        }
        String name = user.getName();
        roomManager.logout(name);
        operations.convertAndSend("/topic/lobby/open_games", Map.of("games", statusMap.openGames()));
    }
}
