package com.bernd.model;

import java.util.HashMap;

public record ChatMessage(
    int n,
    String message,
    String user,
    boolean type,
    HashMap<String, String> pair) {
}
