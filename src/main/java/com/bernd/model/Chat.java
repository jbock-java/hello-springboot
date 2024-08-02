package com.bernd.model;

import java.util.List;

public record Chat(
    String id,
    List<ChatMessage> messages) {
}
