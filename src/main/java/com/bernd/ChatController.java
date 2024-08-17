package com.bernd;

import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.ChatRequest;
import com.bernd.model.Status;
import com.bernd.model.StatusMap;
import com.bernd.model.UserStatus;
import com.bernd.model.UsersMessage;
import com.bernd.util.Auth;
import com.bernd.util.Sender;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ChatController {

  private static final long SCAN_TIMEOUT = 120 * 1000;

  private final Chats chats;
  private final MessageSendingOperations<String> operations;
  private final Sender sender;
  private final StatusMap statusMap = new StatusMap();
  private long lastScan;

  ChatController(
      Chats chats,
      MessageSendingOperations<String> operations,
      Sender sender) {
    this.chats = chats;
    this.operations = operations;
    this.sender = sender;
  }

  @ResponseBody
  @GetMapping("/api/chat/{id}")
  public Chat getChat(@PathVariable String id) {
    return chats.get(id);
  }

  @MessageMapping("/chat/send")
  public void sendChat(ChatRequest chatRequest, Principal principal) {
    String user = Auth.getPrincipal(principal);
    Chat chat = chats.get(chatRequest.id());
    ChatMessage message = new ChatMessage(chat.counter().getAndIncrement(), chatRequest.message(), user);
    chat.messages().add(message);
    if (chat.users().add(user)) {
      operations.convertAndSend("/topic/users/" + chat.id(), new UsersMessage(chat.users()));
    }
    operations.convertAndSend("/topic/chat/" + chat.id(), message);
  }

  @MessageMapping("/chat/status")
  public void updateStatus(Status status, Principal principal) {
    String user = Auth.getPrincipal(principal);
    UserStatus old = statusMap.put(user, UserStatus.create(status.room()));
    if (lastScan + SCAN_TIMEOUT < System.currentTimeMillis()) {
      Map<String, List<String>> allRooms = statusMap.allRooms();
      for (Map.Entry<String, List<String>> e : allRooms.entrySet()) {
        String room = e.getKey();
        List<String> users = e.getValue();
        sender.sendUsers(room, users);
      }
      lastScan = System.currentTimeMillis();
    } else if (old == null) {
      sender.sendUsers(status.room(), statusMap.usersInRoom(status.room()));
    } else if (!old.room().equals(status.room())) {
      sender.sendUsers(status.room(), statusMap.usersInRoom(status.room()));
      sender.sendUsers(status.room(), statusMap.usersInRoom(old.room()));
    }
  }
}
