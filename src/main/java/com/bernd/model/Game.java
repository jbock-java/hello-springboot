package com.bernd.model;

import com.bernd.game.Count;
import com.bernd.game.Direction;
import com.bernd.game.MoveList;
import com.bernd.game.Toggle;
import com.bernd.util.BoardUpdateImpl;
import com.bernd.util.Util;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static com.bernd.game.Board.removeDeadStonesAround;
import static com.bernd.util.Util.COLORS;

public record Game(
    String id,
    User black,
    User white,
    boolean counting,
    int countingAgreed,
    boolean opponentPassed,
    int[][] board,
    int dim,
    int handicap,
    int[] forbidden,
    MoveList moves
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
    if (move.agreeCounting()) {
      if ((countingAgreed | move.color()) == COLORS) {
        moves.addGameEndMarker();
      }
      return toBuilder()
          .withCountingAgreed(countingAgreed | move.color())
          .build();
    }
    moves.add(move, counting);
    if (counting) {
      if (move.resetCounting()) {
        int[][] resetted = Toggle.resetCounting(board);
        return toBuilder()
            .withBoard(Count.count(resetted))
            .withForbidden(NOT_FORBIDDEN)
            .build();
      }
      int[][] toggled = Toggle.toggleStonesAt(board, move.x(), move.y());
      return toBuilder()
          .withBoard(Count.count(toggled))
          .withForbidden(NOT_FORBIDDEN)
          .build();
    }
    if (move.pass()) {
      if (opponentPassed) {
        return toBuilder()
            .withBoard(Count.count(board))
            .withCounting(true)
            .withForbidden(NOT_FORBIDDEN)
            .build();
      }
      return toBuilder()
          .withOpponentPassed(true)
          .withForbidden(NOT_FORBIDDEN)
          .build();
    }
    int x = move.x();
    int y = move.y();
    int color = move.color();
    int[][] updated = BoardUpdateImpl.create(board.length, x, y, color).apply(board);
    int[][] result = removeDeadStonesAround(updated, x, y);
    Direction direction = getDirection(x, y, result, updated);
    if (isKo(x, y, color, result, direction)) {
      return toBuilder()
          .withBoard(result)
          .withForbidden(direction.moveX(x), direction.moveY(y))
          .build();
    }
    return toBuilder()
        .withBoard(result)
        .withForbidden(NOT_FORBIDDEN)
        .build();
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

  // if a single stone was removed next to [xx, yy], get its relative location
  private Direction getDirection(
      int xx,
      int yy,
      int[][] board,
      int[][] updated) {
    int row = -1, col = -1;
    int max = board.length - 1;
    int min_y = Math.max(yy - 2, 0);
    int max_y = Math.min(yy + 2, max);
    for (int y = min_y; y <= max_y; y++) {
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
    int min_x = Math.max(xx - 2, 0);
    int max_x = Math.min(xx + 2, max);
    for (int x = min_x; x <= max_x; x++) {
      if (board[row][x] != updated[row][x]) {
        if (col != -1) {
          return Direction.NONE;
        }
        col = x;
      }
    }
    return Direction.from(xx, yy, col, row);
  }

  public ViewGame toView() {
    return ViewGame.fromGame(this);
  }

  public boolean gameHasEnded() {
    return countingAgreed == COLORS;
  }

  public GameBuilder toBuilder() {
    return GameBuilder.builder(this);
  }
}
