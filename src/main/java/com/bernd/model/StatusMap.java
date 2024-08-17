package com.bernd.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class StatusMap {

  private static final long USER_TIMEOUT = 90 * 1000;

  private final Map<String, UserStatus> map = new LinkedHashMap<>();

  public UserStatus put(String user, UserStatus status) {
    return map.put(user, status);
  }

  public List<String> usersInRoom(String room) {
    List<String> result = new ArrayList<>();
    for (Map.Entry<String, UserStatus> e : map.entrySet()) {
      if (e.getValue().room().equals(room)) {
        result.add(e.getKey());
      }
    }
    return result;
  }

  public Map<String, List<String>> allRooms() {
    long current = System.currentTimeMillis();
    Map<String, List<String>> result = new LinkedHashMap<>();
    List<String> remove = new ArrayList<>();
    for (Map.Entry<String, UserStatus> e : map.entrySet()) {
      UserStatus status = e.getValue();
      String user = e.getKey();
      if (status.lastSeen() + USER_TIMEOUT < current) {
        remove.add(user);
      } else {
        result.computeIfAbsent(status.room(), key -> new ArrayList<>())
            .add(user);
      }
    }
    for (String user : remove) {
      map.remove(user);
    }
    return result;
  }
}
