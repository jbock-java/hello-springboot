package com.bernd.model;

import com.bernd.game.Count;
import com.bernd.game.Direction;
import com.bernd.game.RemoveResult;
import com.bernd.game.Toggle;
import com.bernd.util.BoardUpdateImpl;
import com.bernd.util.Util;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;
import static com.bernd.game.Board.removeDeadStonesAround;

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
    int handicap,
    int[] forbidden
) {

  private static final Logger logger = LogManager.getLogger(Game.class);
  public static final int[] NOT_FORBIDDEN = {-1, -1};

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
        return game(Count.count(resetted), NOT_FORBIDDEN);
      }
      int[][] toggled = Toggle.toggleStonesAt(board, move.x(), move.y());
      return game(Count.count(toggled), NOT_FORBIDDEN);
    }
    if (move.pass()) {
      if (opponentPassed) {
        return startCounting();
      }
      return game(board, counting, true, NOT_FORBIDDEN);
    }
    int x = move.x();
    int y = move.y();
    int color = currentColor();
    int[][] updated = BoardUpdateImpl.create(board.length, x, y, color).apply(board);
    RemoveResult result = removeDeadStonesAround(updated, x, y);
    if (result.isKo(x, y, color)) {
      Direction direction = result.direction();
      return game(result.board(), new int[]{direction.moveX(x), direction.moveY(y)});
    }
    return game(result.board(), NOT_FORBIDDEN);
  }

  private Game game(
      int[][] board,
      boolean counting,
      boolean opponentPassed,
      int[] forbidden) {
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
        Math.max(0, handicap - 1),
        forbidden);
  }

  private Game game(int[][] board, int[] forbidden) {
    return game(board, counting, false, forbidden);
  }

  private Game startCounting() {
    return game(Count.count(board), true, true, NOT_FORBIDDEN);
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
