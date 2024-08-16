package com.bernd.model;

import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

public record Chat(
    String id,
    AtomicInteger counter,
    List<ChatMessage> messages,
    Set<String> users) {
}
