package com.bernd.model;

public record ChatMessage(
    int n,
    String message,
    String user) {
}
