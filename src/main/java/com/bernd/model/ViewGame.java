package com.bernd.model;

import java.util.List;

public record ViewGame(
    String id,
    User black,
    User white,
    int dim,
    int handicap,
    List<GameMove> moves
) {

  static ViewGame fromGame(Game game) {
    return new ViewGame(
        game.id(),
        game.black(),
        game.white(),
        game.dim(),
        game.handicap(),
        game.moves().asList());
  }
}
