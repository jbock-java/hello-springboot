package com.bernd.model;

import java.util.List;

public record Game(
    String id,
    User black,
    User white,
    int currentUser,
    List<String> position
  ) {

  public Game update(Game game) {
    return new Game(
        this.id,
        this.black,
        this.white,
        game.currentUser,
        game.position);
  }
}
