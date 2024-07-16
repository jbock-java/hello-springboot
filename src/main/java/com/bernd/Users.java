package com.bernd;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class Users {

  private final Set<String> users = new HashSet<>();

  public boolean contains(String user) {
    return users.contains(user);
  }

  public void login(String user) {
    users.add(user);
  }

  public void logout(String user) {
    users.remove(user);
  }
}
