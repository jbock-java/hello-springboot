package com.bernd;

import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.ChatRequest;
import com.bernd.util.Auth;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ChatController {

  private final Chats chats;
  private final MessageSendingOperations<String> operations;

  ChatController(
      Chats chats,
      MessageSendingOperations<String> operations) {
    this.chats = chats;
    this.operations = operations;
  }

  @ResponseBody
  @GetMapping("/api/chat/{id}")
  public Chat getChat(@PathVariable String id) {
    System.out.println("GETCHAT " + id);
    return chats.get(id);
  }

  @MessageMapping("/chat/send/")
  public ResponseEntity<?> sendChat(ChatRequest chatRequest, Principal principal) {
    String user = Auth.getPrincipal(principal);
    ChatMessage message = new ChatMessage(chats.chats().size(), chatRequest.message(), user);
    Chat chat = chats.get(chatRequest.id());
    if (chat != null) {
      chat.messages().add(message);
    } else {
      List<ChatMessage> messages = new ArrayList<>();
      messages.add(message);
      chat = new Chat(chatRequest.id(), messages);
    }
    chats.put(chat);
    operations.convertAndSend("/topic/chat/" + chat.id(), message);
    return ResponseEntity.ok().build();
  }

}
