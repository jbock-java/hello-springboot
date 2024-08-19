package com.bernd.model;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public record ChatWithUsers(
    String id,
    AtomicInteger counter,
    List<ChatMessage> messages,
    List<String> users) {
}
