package com.bernd;

import com.bernd.model.User;
import com.bernd.model.UserList;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class LobbyUsers {
  private final Map<String, User> map = new LinkedHashMap<>();

  void add(String name) {
    map.put(name, new User(name));
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

  UserList users() {
    return new UserList(List.copyOf(map.values()));
  }
}
