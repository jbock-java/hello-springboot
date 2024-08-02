package com.bernd;

import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.ChatRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    return chats.get(id);
  }

  @PostMapping("/api/send_chat")
  public ResponseEntity<?> sendChat(@RequestBody ChatRequest chatRequest) {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String user = Objects.toString(principal);
    ChatMessage message = new ChatMessage(chatRequest.message(), user);
    Chat chat = chats.get(chatRequest.id());
    if (chat != null) {
      chat.messages().add(message);
    } else {
      List<ChatMessage> messages = new ArrayList<>();
      messages.add(message);
      chat = new Chat(chatRequest.id(), messages);
    }
    chats.put(chat);
    operations.convertAndSend("/topic/chat/" + chat.id(), chat);
    return ResponseEntity.ok().build();
  }

}
