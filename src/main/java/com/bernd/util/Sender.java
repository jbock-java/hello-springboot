package com.bernd.util;

import com.bernd.model.UsersMessage;
import java.util.Collection;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Component;

@Component
public final class Sender {
  private final MessageSendingOperations<String> operations;

  Sender(MessageSendingOperations<String> operations) {
    this.operations = operations;
  }

  public void sendUsers(String room, Collection<String> users) {
    operations.convertAndSend("/topic/users/" + room, new UsersMessage(users));
  }
}
