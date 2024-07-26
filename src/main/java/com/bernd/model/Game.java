package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.game.Count;
import com.bernd.game.Toggle;
import com.bernd.util.BoardUpdate;
import com.bernd.util.Util;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;

public record Game(
    String id,
    User black,
    User white,
    boolean editMode,
    boolean counting,
    String currentPlayer,
    int currentColor,
    boolean opponentPassed,
    int[][] board,
    int handicap
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
      if (move.resetCounting()) {
        int[][] resetted = Toggle.resetCounting(board);
        return game(Count.count(resetted));
      }
      int[][] toggled = Toggle.toggleStonesAt(board, move.x(), move.y());
      return game(Count.count(toggled));
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
        editMode,
        counting,
        nextPlayer(),
        nextColor(),
        opponentPassed,
        board,
        Math.max(0, handicap - 1));
  }

  private Game game(int[][] board) {
    return game(board, counting, false);
  }

  private Game startCounting() {
    return game(Count.count(board), true, true);
  }

  private String nextPlayer() {
    if (editMode || handicap > 0) {
      return currentPlayer;
    }
    return currentPlayer.equals(black.name()) ? white().name() : black().name();
  }

  private int nextColor() {
    if (handicap > 0) {
      return currentColor;
    }
    return currentColor == B ? W : B;
  }
}
