package com.bernd.game;

import com.bernd.util.BoardUpdate;
import java.util.function.Function;

public class Board {

  public static final int B = 32;
  public static final int W = 64;
  public static final int FORBIDDEN = 1;
  public static final int TERRITORY = 2;
  public static final int REMOVED = 4;

  private static Function<int[][], int[][]> getStoneGroup(
      int[][] board,
      int xx,
      int yy) {
    int dim = board.length;
    if (yy > 0 && board[yy - 1][xx] == 0) {
      return Function.identity();
    }
    if (yy < dim - 1 && board[yy + 1][xx] == 0) {
      return Function.identity();
    }
    if (xx > 0 && board[yy][xx - 1] == 0) {
      return Function.identity();
    }
    if (xx < dim - 1 && board[yy][xx + 1] == 0) {
      return Function.identity();
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
          return Function.identity();
        } else if (bpt == color && !pointsChecked.has(x, y - 1)) {
          pointsChecked.add(x, y - 1);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int bpt = board[y + 1][x];
        if (bpt == 0) {
          return Function.identity();
        } else if (bpt == color && !pointsChecked.has(x, y + 1)) {
          pointsChecked.add(x, y + 1);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int bpt = board[y][x - 1];
        if (bpt == 0) {
          return Function.identity();
        } else if (bpt == color && !pointsChecked.has(x - 1, y)) {
          pointsChecked.add(x - 1, y);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int bpt = board[y][x + 1];
        if (bpt == 0) {
          return Function.identity();
        } else if (bpt == color && !pointsChecked.has(x + 1, y)) {
          pointsChecked.add(x + 1, y);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    BoardUpdate update = BoardUpdate.builder(dim, acc.size());
    acc.forEach(update::add);
    return update;
  }

  public static int[][] removeDeadStonesAround(
      int[][] board,
      int x,
      int y) {
    int color = board[y][x];
    if (color == 0) {
      return board;
    }
    int oppositeColor = color == W ? B : W;
    int size = board.length;
    int[][] result = board;
    // Above
    if (y > 0 && board[y - 1][x] == oppositeColor) {
      result = getStoneGroup(board, x, y - 1).apply(result);
    }
    // Below
    if (y < size - 1 && board[y + 1][x] == oppositeColor) {
      result = getStoneGroup(board, x, y + 1).apply(result);
    }
    // Left
    if (x > 0 && board[y][x - 1] == oppositeColor) {
      result = getStoneGroup(board, x - 1, y).apply(result);
    }
    // Right
    if (x < size - 1 && board[y][x + 1] == oppositeColor) {
      result = getStoneGroup(board, x + 1, y).apply(result);
    }
    return result;
  }
}
