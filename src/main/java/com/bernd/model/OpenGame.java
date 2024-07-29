package com.bernd.model;

import static com.bernd.LobbyController.createEmptyBoard;
import static com.bernd.game.Board.B;

public record OpenGame(
    String id,
    User user,
    int dim,
    int handicap) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, dim, handicap);
  }

  public OpenGame withUser(String name) {
    return new OpenGame(id, new User(name), dim, handicap);
  }

  public Game accept(String white) {
    return new Game(
        id,
        user,
        new User(white),
        false,
        false,
        user.name(),
        B,
        false,
        createEmptyBoard(dim),
        handicap,
        new int[]{-1, -1});
  }
}
