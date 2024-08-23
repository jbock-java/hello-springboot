package com.bernd.model;

import java.util.LinkedHashMap;
import java.util.Map;

public record ChatMessage(
    int n,
    String message,
    String user,
    String type,
    Map<String, String> rows) {

  public static ChatMessage createStartMessage(Chat chat, Game game) {
    Map<String, String> rows = new LinkedHashMap<>();
    rows.put("Black", game.black());
    rows.put("White", game.white());
    int handicap = game.handicap();
    rows.put("Handicap", handicap == 0 ? "-" : Integer.toString(handicap));
    return new ChatMessage(chat.counter().getAndIncrement(), "Game Start", null, "start", rows);
  }
}
