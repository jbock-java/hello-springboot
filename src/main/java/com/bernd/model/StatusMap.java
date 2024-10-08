package com.bernd.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public final class StatusMap {

  private final Map<String, UserStatus> map = new LinkedHashMap<>();

  public UserStatus put(String user, String room) {
    return map.put(user, UserStatus.create(room));
  }

  public String get(String user) {
    UserStatus status = map.get(user);
    if (status == null) {
      return null;
    }
    return put(user, status.room()).room();
  }

  public String remove(String user) {
    UserStatus status = map.remove(user);
    if (status == null) {
      return null;
    }
    return status.room();
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

  /**
   * @return all changed rooms, where inactive users have been removed
   */
  public Map<String, List<String>> removeInactiveUsers() {
    long current = System.currentTimeMillis();
    Map<String, List<String>> tmp = new HashMap<>();
    List<RemoveTask> removeTasks = new ArrayList<>();
    for (Map.Entry<String, UserStatus> e : map.entrySet()) {
      UserStatus status = e.getValue();
      String room = status.room();
      String user = e.getKey();
      if (status.isActive(current)) {
        tmp.computeIfAbsent(room, key -> new ArrayList<>()).add(user);
      } else {
        removeTasks.add(new RemoveTask(user, room));
      }
    }
    Map<String, List<String>> result = new LinkedHashMap<>(Math.max(8, (int) (tmp.size() * 1.5)));
    for (RemoveTask task : removeTasks) {
      result.put(task.room, tmp.getOrDefault(task.room, List.of()));
      map.remove(task.user);
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

  public boolean contains(String user) {
    return map.containsKey(user);
  }

  private record RemoveTask(String user, String room) {
  }
}
