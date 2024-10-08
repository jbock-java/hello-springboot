package com.bernd.model;

import java.util.List;

public record ViewGame(
    String id,
    String black,
    String white,
    int dim,
    int timesetting,
    int handicap,
    List<Move> moves
) {

  static ViewGame fromGame(Game game) {
    return new ViewGame(
        game.id(),
        game.black(),
        game.white(),
        game.dim(),
        game.timesetting(),
        game.handicap(),
        game.moves().moves());
  }
}
