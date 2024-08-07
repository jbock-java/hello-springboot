package com.bernd;

import com.bernd.model.User;
import com.bernd.model.UserList;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class LobbyUsers {
  private final Map<String, User> map = new LinkedHashMap<>();

  void add(String name) {
    map.put(name, new User(name));
  }

  User get(String name) {
    return map.get(name);
  }

  User remove(String principal) {
    return map.remove(principal);
  }

  UserList users() {
    Collection<User> values = map.values();
    return new UserList(List.copyOf(values));
  }
}
