package com.bernd;

import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.ChatRequest;
import com.bernd.model.ChatWithUsers;
import com.bernd.model.Status;
import com.bernd.model.StatusMap;
import com.bernd.util.Auth;
import com.bernd.util.RoomManager;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;

@Controller
public class ChatController {

  private final Chats chats;
  private final MessageSendingOperations<String> operations;
  private final StatusMap statusMap;
  private final RoomManager roomManager;

  ChatController(
      Chats chats,
      MessageSendingOperations<String> operations,
      StatusMap statusMap,
      RoomManager roomManager) {
    this.chats = chats;
    this.operations = operations;
    this.statusMap = statusMap;
    this.roomManager = roomManager;
  }

  @ResponseBody
  @GetMapping("/api/chat/{id}")
  public ChatWithUsers getChat(@PathVariable String id) {
    String user = Auth.getPrincipal();
    roomManager.updateStatus(user, id);
    return chats.get(id).withUsers(statusMap.usersInRoom(id));
  }

  @MessageMapping("/chat/send")
  public void sendChat(ChatRequest chatRequest, Principal principal) {
    String user = Auth.getPrincipal(principal);
    Chat chat = chats.get(chatRequest.id());
    ChatMessage message = new ChatMessage(chat.counter().getAndIncrement(), chatRequest.message(), user, false, null);
    chat.messages().add(message);
    roomManager.updateRooms(user, chat.id());
    operations.convertAndSend("/topic/chat/" + chat.id(), message);
  }

  @MessageMapping("/chat/status")
  public void updateStatus(Status status, Principal principal) {
    String user = Auth.getPrincipal(principal);
    roomManager.updateRooms(user, status.room());
  }
}
