package com.bernd.model;

public record ActiveGame(
    String id,
    User black,
    User white,
    int dim
) {

  public static ActiveGame fromGame(Game game) {
    return new ActiveGame(
        game.id(),
        game.black(),
        game.white(),
        game.board().length);
  }
}
