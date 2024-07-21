package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.game.Count;
import com.bernd.game.Toggle;
import com.bernd.util.BoardUpdate;
import com.bernd.util.Util;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public record Game(
    String id,
    User black,
    User white,
    boolean counting,
    String currentPlayer,
    boolean opponentPassed,
    int[][] board
) {

  private static final Logger logger = LogManager.getLogger(Game.class);

  public Game update(Move move) {
    try {
      return updateInternal(move);
    } catch (RuntimeException e) {
      logger.error("{}\n{}\n", move, Util.boardToString(board), e);
      return this;
    }
  }

  private Game updateInternal(Move move) {
    if (counting) {
      return game(Count.count(Toggle.toggleStonesAt(board, move.x(), move.y())));
    }
    if (move.pass()) {
      if (opponentPassed) {
        return startCounting();
      }
      return game(board, counting, true);
    }
    int x = move.x();
    int y = move.y();
    int color = currentColor();
    int[][] updated = BoardUpdate.create(board.length, x, y, color).apply(board);
    return game(Board.removeDeadStonesAround(updated, x, y));
  }

  private Game game(
      int[][] board,
      boolean counting,
      boolean opponentPassed) {
    return new Game(
        id,
        black,
        white,
        counting,
        nextPlayer(),
        opponentPassed,
        board);
  }

  private Game game(int[][] board) {
    return game(board, counting, false);
  }

  private Game startCounting() {
    return game(Count.count(board), true, true);
  }

  private String nextPlayer() {
    return currentPlayer.equals(black.name()) ? white().name() : black().name();
  }

  private int currentColor() {
    return currentPlayer.equals(black().name()) ? Board.B : Board.W;
  }
}
