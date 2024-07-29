package com.bernd.game;

import com.bernd.util.BoardUpdate;
import com.bernd.util.BoardUpdateImpl;

public class Board {

  public static final int B = 32;
  public static final int W = 64;
  public static final int TERRITORY_B = 2;
  public static final int TERRITORY_W = 4;
  public static final int REMOVED_B = 8;
  public static final int REMOVED_W = 16;

  private static BoardUpdate getStoneGroup(
      int[][] board,
      int xx,
      int yy) {
    int dim = board.length;
    if (yy > 0 && board[yy - 1][xx] == 0) {
      return BoardUpdateImpl.identity();
    }
    if (yy < dim - 1 && board[yy + 1][xx] == 0) {
      return BoardUpdateImpl.identity();
    }
    if (xx > 0 && board[yy][xx - 1] == 0) {
      return BoardUpdateImpl.identity();
    }
    if (xx < dim - 1 && board[yy][xx + 1] == 0) {
      return BoardUpdateImpl.identity();
    }
    int color = board[yy][xx];
    PointList acc = PointList.create(dim);
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      acc.add(x, y);
      if (y > 0) {
        int bpt = board[y - 1][x];
        if (bpt == 0) {
          return BoardUpdateImpl.identity();
        } else if (bpt == color && !pointsChecked.has(x, y - 1)) {
          pointsChecked.add(x, y - 1);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int bpt = board[y + 1][x];
        if (bpt == 0) {
          return BoardUpdateImpl.identity();
        } else if (bpt == color && !pointsChecked.has(x, y + 1)) {
          pointsChecked.add(x, y + 1);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int bpt = board[y][x - 1];
        if (bpt == 0) {
          return BoardUpdateImpl.identity();
        } else if (bpt == color && !pointsChecked.has(x - 1, y)) {
          pointsChecked.add(x - 1, y);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int bpt = board[y][x + 1];
        if (bpt == 0) {
          return BoardUpdateImpl.identity();
        } else if (bpt == color && !pointsChecked.has(x + 1, y)) {
          pointsChecked.add(x + 1, y);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    BoardUpdateImpl update = BoardUpdateImpl.builder(dim, acc.size());
    acc.forEach(update::add);
    return update;
  }

  public static RemoveResult removeDeadStonesAround(
      int[][] board,
      int x,
      int y) {
    int color = board[y][x];
    if (color == 0) {
      return new RemoveResult(board, Direction.NONE);
    }
    int oppositeColor = color == W ? B : W;
    int size = board.length;
    int[][] result = board;
    int removed = 0;
    Direction direction = Direction.NONE;
    // Above
    if (y > 0 && board[y - 1][x] == oppositeColor) {
      BoardUpdate north = getStoneGroup(board, x, y - 1);
      removed += north.size();
      if (north.size() != 0) {
        direction = Direction.NORTH;
      }
      result = north.apply(result);
    }
    // Below
    if (y < size - 1 && board[y + 1][x] == oppositeColor) {
      BoardUpdate south = getStoneGroup(board, x, y + 1);
      removed += south.size();
      if (south.size() != 0) {
        direction = Direction.SOUTH;
      }
      result = south.apply(result);
    }
    // Left
    if (x > 0 && board[y][x - 1] == oppositeColor) {
      BoardUpdate west = getStoneGroup(board, x - 1, y);
      removed += west.size();
      if (west.size() != 0) {
        direction = Direction.WEST;
      }
      result = west.apply(result);
    }
    // Right
    if (x < size - 1 && board[y][x + 1] == oppositeColor) {
      BoardUpdate east = getStoneGroup(board, x + 1, y);
      removed += east.size();
      if (east.size() != 0) {
        direction = Direction.EAST;
      }
      result = east.apply(result);
    }
    if (removed == 1) {
      return new RemoveResult(result, direction);
    }
    return new RemoveResult(result, Direction.NONE);
  }
}
