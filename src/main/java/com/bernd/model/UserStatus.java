package com.bernd.model;

public record UserStatus(String room, long lastSeen) {
  public static UserStatus create(String room) {
    return new UserStatus(room, System.currentTimeMillis());
  }
}
