package com.bernd.model;

import com.bernd.game.Count;
import com.bernd.game.Direction;
import com.bernd.game.Toggle;
import com.bernd.util.BoardUpdateImpl;
import com.bernd.util.Util;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;
import static com.bernd.game.Board.removeDeadStonesAround;
import static com.bernd.util.Util.COLORS;

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
    int[][] result = removeDeadStonesAround(updated, x, y);
    Direction direction = getDirection(x, y, result, updated);
    if (isKo(x, y, color, result, direction)) {
      return game(result, new int[]{direction.moveX(x), direction.moveY(y)});
    }
    return game(result, NOT_FORBIDDEN);
  }

  private boolean isKo(
      int xx,
      int yy,
      int color,
      int[][] board,
      Direction direction) {
    if (direction == Direction.NONE) {
      return false;
    }
    int x = direction.moveX(xx);
    int y = direction.moveY(yy);
    int oppositeColor = color ^ COLORS;
    int[][] updated = BoardUpdateImpl.create(board.length, x, y, oppositeColor).apply(board);
    int[][] result = removeDeadStonesAround(updated, x, y);
    Direction newDirection = getDirection(x, y, updated, result);
    return newDirection.isOpposite(direction);
  }

  // check if a single stone was removed, get its location relative to [xx, yy]
  private Direction getDirection(
      int xx,
      int yy,
      int[][] board,
      int[][] updated) {
    int row = -1, col = -1;
    for (int y = 0; y < board.length; y++) {
      if (board[y] != updated[y]) {
        if (row != -1) {
          return Direction.NONE;
        }
        row = y;
      }
    }
    if (row == -1) {
      return Direction.NONE;
    }
    for (int x = 0; x < board[row].length; x++) {
      if (board[row][x] != updated[row][x]) {
        if (col != -1) {
          return Direction.NONE;
        }
        col = x;
      }
    }
    return Direction.from(xx, yy, col, row);
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
