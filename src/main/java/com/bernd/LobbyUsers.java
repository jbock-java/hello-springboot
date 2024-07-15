package com.bernd;

import com.bernd.model.User;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class LobbyUsers {
  private final Map<String, User> map = new LinkedHashMap<>();

  void add(Principal principal, String name) {
    map.put(principal.getName(), new User(Integer.parseInt(principal.getName()), name));
  }

  User get(Principal principal) {
    if (principal == null) {
      return null;
    }
    return map.get(principal.getName());
  }

  void remove(String principal) {
    map.remove(principal);
  }

  List<User> users() {
    return List.copyOf(map.values());
  }
}