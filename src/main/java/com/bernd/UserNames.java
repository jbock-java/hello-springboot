package com.bernd;

import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class UserNames {
  private final Map<String, String> map = new HashMap<>();

  void setName(Principal principal, String name) {
    map.put(principal.getName(), name);
  }

  String getName(Principal principal) {
    if (principal == null) {
      return "";
    }
    return map.getOrDefault(principal.getName(), "");
  }
}
