package com.bernd.model;

import java.util.List;

public record Game(
    String gameId,
    User black,
    User white,
    int currentUser,
    List<String> position
  ) {
}
