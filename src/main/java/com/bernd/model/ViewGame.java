package com.bernd.model;

import java.util.List;

public record ViewGame(
    String id,
    User black,
    User white,
    boolean editMode,
    boolean counting,
    String currentPlayer,
    int currentColor,
    boolean opponentPassed,
    int[][] board,
    int handicap,
    int[] forbidden,
    List<GameMove> moves
) {

  static ViewGame fromGame(Game game) {
    return new ViewGame(
        game.id(),
        game.black(),
        game.white(),
        game.editMode(),
        game.counting(),
        game.currentPlayer(),
        game.currentColor(),
        game.opponentPassed(),
        game.board(),
        game.handicap(),
        game.forbidden(),
        game.moves().asList());
  }
}
