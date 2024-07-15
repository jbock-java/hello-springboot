package com.bernd;

import com.bernd.model.Game;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class Games {
  private final Map<String, Game> map = new LinkedHashMap<>();

  List<Game> games() {
    return List.copyOf(map.values());
  }
}
