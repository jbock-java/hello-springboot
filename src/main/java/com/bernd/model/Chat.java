package com.bernd.model;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public record Chat(
    String id,
    AtomicInteger counter,
    List<ChatMessage> messages) {
  public ChatWithUsers withUsers(List<String> users) {
    return new ChatWithUsers(id, counter, messages, users);
  }
}
