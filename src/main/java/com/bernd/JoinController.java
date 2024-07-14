package com.bernd;

import com.bernd.model.JoinRequest;
import com.bernd.model.JoinResponse;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class JoinController {

  private final MessageSendingOperations<String> operations;

  private final Users users;

  JoinController(
      MessageSendingOperations<String> operations,
      Users users) {
    this.operations = operations;
    this.users = users;
  }

  @MessageMapping("/join")
  public void joinAction(JoinRequest request, Principal principal) {
    users.setName(principal, request.name());
    String channel = request.channel();
    operations.convertAndSend("/topic/join/" + channel,
        new JoinResponse(Integer.parseInt(principal.getName()))); 
  }
}