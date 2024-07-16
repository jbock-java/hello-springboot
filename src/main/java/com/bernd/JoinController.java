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

  JoinController(
      MessageSendingOperations<String> operations) {
    this.operations = operations;
  }

  @MessageMapping("/join")
  public void joinAction(JoinRequest request, Principal principal) {
    String channel = request.channel();
    operations.convertAndSend("/topic/join/" + channel,
        new JoinResponse(request.name(), principal.getName()));
  }
}