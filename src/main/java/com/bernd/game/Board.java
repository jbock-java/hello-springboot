package com.bernd.game;

import com.bernd.util.BoardUpdate;

public class Board {

  public static final int B = 32;
  public static final int W = 64;
  public static final int FORBIDDEN = 1;
  public static final int TERRITORY = 2;
  public static final int REMOVED = 4;

  private static StoneGroup getStoneGroup(
      int[][] board,
      int xx,
      int yy) {
    int color = board[yy][xx];
    int dim = board.length;
    BoardUpdate update = BoardUpdate.builder(dim);
    int liberties = 0;
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      update.add(x, y, 0);
      if (y > 0) {
        int bpt = board[y - 1][x];
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked.has(x, y - 1)) {
          pointsChecked.add(x, y - 1);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int bpt = board[y + 1][x];
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked.has(x, y + 1)) {
          pointsChecked.add(x, y + 1);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int bpt = board[y][x - 1];
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked.has(x - 1, y)) {
          pointsChecked.add(x - 1, y);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int bpt = board[y][x + 1];
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked.has(x + 1, y)) {
          pointsChecked.add(x + 1, y);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    return new StoneGroup(
        update,
        liberties);
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
      StoneGroup group = getStoneGroup(board, x, y - 1);
      if (group.liberties() == 0) {
        result = group.update().apply(result);
      }
    }
    // Below
    if (y < size - 1 && board[y + 1][x] == oppositeColor) {
      StoneGroup group = getStoneGroup(board, x, y + 1);
      if (group.liberties() == 0) {
        result = group.update().apply(result);
      }
    }
    // Left
    if (x > 0 && board[y][x - 1] == oppositeColor) {
      StoneGroup group = getStoneGroup(board, x - 1, y);
      if (group.liberties() == 0) {
        result = group.update().apply(result);
      }
    }
    // Right
    if (x < size - 1 && board[y][x + 1] == oppositeColor) {
      StoneGroup group = getStoneGroup(board, x + 1, y);
      if (group.liberties() == 0) {
        result = group.update().apply(result);
      }
    }
    return result;
  }
}
