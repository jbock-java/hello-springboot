package com.bernd.game;

import com.bernd.util.BoardUpdate;
import java.util.Arrays;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;

public class Count {

  private static int getImpliedColor(
      int[][] board,
      int xx,
      int yy) {
    if (board[yy][xx] != 0) {
      return board[yy][xx];
    }
    int dim = board.length;
    PointSet pointsChecked = PointSet.create(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      pointsChecked.add(x, y);
      if (board[y][x] != 0) {
        return board[y][x] + TERRITORY;
      }
      if (y > 0 && !pointsChecked.has(x, y - 1)) {
        pointsToCheck.offer(x, y - 1);
      }
      if (y < dim - 1 && !pointsChecked.has(x, y + 1)) {
        pointsToCheck.offer(x, y + 1);
      }
      if (x > 0 && !pointsChecked.has(x - 1, y)) {
        pointsToCheck.offer(x - 1, y);
      }
      if (x < dim - 1 && !pointsChecked.has(x + 1, y)) {
        pointsToCheck.offer(x + 1, y);
      }
    }
    throw new RuntimeException("empty board");
  }

  private static void markStonesAround(
      int[][] acc,
      int[][] board,
      int xx,
      int yy) {
    int color = getImpliedColor(board, xx, yy);
    if ((color & TERRITORY) == 0) {
      acc[yy][xx] = color;
      return;
    }
    boolean oppositeStonesFound = false;
    int baseColor = color - TERRITORY;
    int oppositeColor = baseColor == W ? B : W;
    int dim = board.length;
    BoardUpdate updater = BoardUpdate.builder(dim, 64);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      acc[y][x] = color;
      updater.add(x, y);
      if (y > 0) {
        int c = board[y - 1][x];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (c == 0 && acc[y - 1][x] != color) {
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int c = board[y + 1][x];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (c == 0 && acc[y + 1][x] != color) {
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int c = board[y][x - 1];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (c == 0 && acc[y][x - 1] != color) {
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int c = board[y][x + 1];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (c == 0 && acc[y][x + 1] != color) {
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    if (oppositeStonesFound) {
      for (int i = 0; i < updater.size(); i++) {
        acc[updater.y(i)][updater.x(i)] = 0;
      }
    }
  }

  public static int[][] count(
      int[][] board) {
    int[][] acc = createAcc(board);
    for (int y = 0; y < board.length; y++) {
      int[] row = board[y];
      for (int x = 0; x < row.length; x++) {
        if (acc[y][x] == -1) {
          markStonesAround(acc, board, x, y);
        }
      }
    }
    return acc;
  }

  private static int[][] createAcc(int[][] board) {
    int[][] result = new int[board.length][];
    for (int i = 0; i < board.length; i++) {
      result[i] = new int[result.length];
      Arrays.fill(result[i], -1);
    }
    return result;
  }
}
