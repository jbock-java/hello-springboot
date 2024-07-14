package com.bernd;

import com.bernd.model.JoinRequest;
import com.bernd.model.JoinResponse;
import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class JoinController {

  private final MessageSendingOperations<String> operations;

  private final UserNames userNames;

  @Autowired
  JoinController(
      MessageSendingOperations<String> operations,
      UserNames userNames) {
    this.operations = operations;
    this.userNames = userNames;
  }

  @MessageMapping("/join")
  public void joinAction(JoinRequest request, Principal principal) {
    userNames.setName(principal, request.name());
    String channel = request.channel();
    operations.convertAndSend("/topic/join/" + channel,
        new JoinResponse(Integer.parseInt(principal.getName()))); 
  }
}