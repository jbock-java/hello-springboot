package com.bernd.game;

import com.bernd.util.Util;
import java.util.Arrays;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;
import static com.bernd.util.Util.isStone;
import static com.bernd.util.Util.keepMarkers;

public class Count {

  static int getImpliedColor(
      int[][] board,
      int xx,
      int yy) {
    if (isStone(board[yy][xx])) {
      return board[yy][xx];
    }
    int dim = board.length;
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      if (isStone(board[y][x])) {
        return board[y][x] | TERRITORY;
      }
      if (y > 0 && !pointsChecked.has(x, y - 1)) {
        pointsChecked.add(x, y - 1);
        pointsToCheck.offer(x, y - 1);
      }
      if (y < dim - 1 && !pointsChecked.has(x, y + 1)) {
        pointsChecked.add(x, y + 1);
        pointsToCheck.offer(x, y + 1);
      }
      if (x > 0 && !pointsChecked.has(x - 1, y)) {
        pointsChecked.add(x - 1, y);
        pointsToCheck.offer(x - 1, y);
      }
      if (x < dim - 1 && !pointsChecked.has(x + 1, y)) {
        pointsChecked.add(x + 1, y);
        pointsToCheck.offer(x + 1, y);
      }
    }
    return 0;
  }

  static void colorEmptyTerritory(
      int[][] board,
      int[][] acc,
      int xx,
      int yy) {
    int color = getImpliedColor(board, xx, yy);
    if (color == 0) { // empty board => no color
      for (int[] row : acc) {
        Arrays.fill(row, 0);
      }
      return;
    }
    if ((color & TERRITORY) == 0) {
      acc[yy][xx] = color;
      return;
    }
    boolean oppositeStonesFound = false;
    int oppositeColor = (color & W) != 0 ? B : W;
    int dim = board.length;
    PointList tracker = PointList.create(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    acc[yy][xx] = color;
    tracker.add(xx, yy);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      tracker.add(x, y);
      if (y > 0) {
        int c = board[y - 1][x];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (Util.isEmpty(c) && acc[y - 1][x] == -1) {
          acc[y - 1][x] = keepMarkers(color, c);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int c = board[y + 1][x];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (Util.isEmpty(c) && acc[y + 1][x] == -1) {
          acc[y + 1][x] = keepMarkers(color, c);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int c = board[y][x - 1];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (Util.isEmpty(c) && acc[y][x - 1] == -1) {
          acc[y][x - 1] = keepMarkers(color, c);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int c = board[y][x + 1];
        if (c == oppositeColor) {
          oppositeStonesFound = true;
        }
        if (Util.isEmpty(c) && acc[y][x + 1] == -1) {
          acc[y][x + 1] = keepMarkers(color, c);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    if (oppositeStonesFound) {
      tracker.forEach((x, y) -> acc[y][x] = 0);
    }
  }

  public static int[][] count(
      int[][] board) {
    int[][] acc = createAcc(board);
    for (int y = 0; y < board.length; y++) {
      int[] row = board[y];
      for (int x = 0; x < row.length; x++) {
        if (acc[y][x] == -1) {
          colorEmptyTerritory(board, acc, x, y);
        }
      }
    }
    return acc;
  }

  static int[][] createAcc(int[][] board) {
    int[][] result = new int[board.length][];
    for (int i = 0; i < board.length; i++) {
      result[i] = new int[result.length];
      Arrays.fill(result[i], -1);
    }
    return result;
  }
}
