package com.bernd.model;

import com.bernd.game.Board;
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
    String black,
    String white,
    boolean counting,
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
    if (move.agreeCounting() && (isSelfPlay() || (countingAgreed() | move.color()) == COLORS)) {
      moves.addGameEndMarker();
    } else {
      moves.add(move);
    }
    if (move.agreeCounting()) {
      return toBuilder().build();
    }
    if (counting) {
      int[][] updated = move.resetCounting() ?
          Toggle.resetCounting(board) :
          Toggle.toggleStonesAt(board, move.x(), move.y());
      return toBuilder()
          .withBoard(Count.count(updated))
          .withForbidden(NOT_FORBIDDEN)
          .build();
    }
    if (move.pass()) {
      if (opponentPassed()) {
        return toBuilder()
            .withCounting(true)
            .withBoard(Count.count(board))
            .withForbidden(NOT_FORBIDDEN)
            .build();
      }
      return toBuilder()
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
    if (moves.isEmpty()) {
      return false;
    }
    return getLastMove().end();
  }

  public GameBuilder toBuilder() {
    return GameBuilder.builder(this);
  }

  public boolean isSelfPlay() {
    return black.equals(white);
  }

  public boolean isWhite(String name) {
    return white.equals(name);
  }

  public boolean isBlack(String name) {
    return black.equals(name);
  }

  public Move getLastMove() {
    return moves.get(moves.size() - 1);
  }

  boolean opponentPassed() {
    if (moves.isEmpty()) {
      return false;
    }
    return getLastMove().pass();
  }

  public int countingAgreed() {
    if (moves.isEmpty()) {
      return 0;
    }
    Move lastMove = getLastMove();
    return lastMove.agreeCounting() ? lastMove.color() : 0;
  }

  public int remainingHandicap() {
    return Math.max(0, handicap - moves.size());
  }

  public boolean isForbidden(Move move) {
    return move.x() == forbidden[0] && move.y() == forbidden[1];
  }

  public String getScore() {
    int w = 0;
    int b = 0;
    for (int y = 0; y < board().length; y++) {
      for (int x = 0; x < board[y].length; x++) {
        int color = board[y][x];
        if ((color & (Board.W | Board.TERRITORY_W)) != 0) {
          w++;
        }
        if ((color & (Board.B | Board.TERRITORY_B)) != 0) {
          b++;
        }
      }
    }
    return w > b ? "W+" + w : "B+" + b;
  }
}
