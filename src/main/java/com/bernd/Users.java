package com.bernd;

import com.bernd.model.User;
import com.bernd.util.Auth;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class Users {

  private final Map<String, User> users = new LinkedHashMap<>();

  public User get(Principal principal) {
    String name = Auth.getPrincipal(principal);
    return users.computeIfAbsent(name, User::new);
  }

  public boolean contains(String user) {
    return users.containsKey(user);
  }

  public void login(String user) {
    users.put(user, new User(user));
  }

  public void logout(String user) {
    users.remove(user);
  }
}
