package com.bernd;

import com.bernd.model.User;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Component
public class Users {
  private final Map<String, User> map = new HashMap<>();

  void setName(Principal principal, String name) {
    map.put(principal.getName(), new User(Integer.parseInt(principal.getName()), name));
  }

  User get(Principal principal) {
    if (principal == null) {
      return null;
    }
    return map.get(principal.getName());
  }
}