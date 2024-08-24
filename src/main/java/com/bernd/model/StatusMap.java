package com.bernd.model;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public final class StatusMap {

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

  public Map<String, List<String>> prune() {
    long current = System.currentTimeMillis();
    Map<String, List<String>> tmp = new HashMap<>();
    List<RemoveItem> remove = new ArrayList<>();
    for (Map.Entry<String, UserStatus> e : map.entrySet()) {
      UserStatus status = e.getValue();
      String room = status.room();
      String user = e.getKey();
      if (status.isActive(current)) {
        tmp.computeIfAbsent(room, key -> new ArrayList<>()).add(user);
      } else {
        remove.add(new RemoveItem(user, room));
      }
    }
    Map<String, List<String>> result = new LinkedHashMap<>(Math.max(8, (int) (tmp.size() * 1.5)));
    for (RemoveItem item : remove) {
      result.put(item.room, tmp.getOrDefault(item.room, List.of()));
      map.remove(item.user);
    }
    return result;
  }

  public Set<String> activeGames() {
    Set<String> result = new LinkedHashSet<>();
    long current = System.currentTimeMillis();
    for (UserStatus status : map.values()) {
      if (status.isActive(current)) {
        result.add(status.room());
      }
    }
    return result;
  }

  private record RemoveItem(String user, String room) {
  }
}
