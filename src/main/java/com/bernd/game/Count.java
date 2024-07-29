package com.bernd.game;

import java.util.Arrays;

import static com.bernd.util.Util.TERRITORY;
import static com.bernd.util.Util.COLORS;
import static com.bernd.util.Util.asRemoved;
import static com.bernd.util.Util.asTerritory;
import static com.bernd.util.Util.isEmpty;
import static com.bernd.util.Util.isStone;

public class Count {

  static int findStone(
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
        return board[y][x];
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
    if (isStone(board[yy][xx])) {
      acc[yy][xx] = board[yy][xx];
      return;
    }
    int found = findStone(board, xx, yy);
    if (found == 0) { // empty board
      for (int[] row : acc) {
        Arrays.fill(row, 0);
      }
      return;
    }
    boolean disputed = false;
    int opponentColor = found ^ COLORS;
    int dim = board.length;
    PointList territory = PointList.create(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    acc[yy][xx] = getTerritoryMarker(found, board[yy][xx]);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      territory.add(x, y);
      if (y > 0) {
        int c = board[y - 1][x];
        disputed |= c == opponentColor;
        if (isEmpty(c) && acc[y - 1][x] == -1) {
          acc[y - 1][x] = getTerritoryMarker(found, c);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int c = board[y + 1][x];
        disputed |= c == opponentColor;
        if (isEmpty(c) && acc[y + 1][x] == -1) {
          acc[y + 1][x] = getTerritoryMarker(found, c);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int c = board[y][x - 1];
        disputed |= c == opponentColor;
        if (isEmpty(c) && acc[y][x - 1] == -1) {
          acc[y][x - 1] = getTerritoryMarker(found, c);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int c = board[y][x + 1];
        disputed |= c == opponentColor;
        if (isEmpty(c) && acc[y][x + 1] == -1) {
          acc[y][x + 1] = getTerritoryMarker(found, c);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    if (disputed) {
      territory.forEach((x, y) -> acc[y][x] = board[y][x] & ~TERRITORY);
    }
  }

  private static int getTerritoryMarker(int found, int empty) {
    if ((empty & asRemoved(found)) != 0) {
      // resurrect
      return found;
    }
    return asTerritory(found) | (empty & ~TERRITORY);
  }

  public static int[][] count(int[][] board) {
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
