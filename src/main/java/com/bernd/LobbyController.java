package com.bernd;

import com.bernd.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class LobbyController {

  private final SimpUserRegistry simpUserRegistry;
  private final UserNames userNames;

  @Autowired
  public LobbyController(
      SimpUserRegistry simpUserRegistry,
      UserNames userNames) {
    this.simpUserRegistry = simpUserRegistry;
    this.userNames = userNames;
  }

  @GetMapping("/data/users")
  public List<User> connectedUsers() {
    return simpUserRegistry
        .getUsers()
        .stream()
        .map(u -> new User(Integer.parseInt(u.getName()), userNames.getName(u.getPrincipal())))
        .collect(Collectors.toList());
  }
}
