package com.bernd;

import com.bernd.model.UserList;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class LobbyUsers {
  private final Map<String, String> map = new LinkedHashMap<>();

  void add(String name) {
    map.put(name, name);
  }

  String get(String name) {
    return map.get(name);
  }

  String remove(String principal) {
    return map.remove(principal);
  }

  UserList users() {
    Collection<String> values = map.values();
    return new UserList(List.copyOf(values));
  }
}
