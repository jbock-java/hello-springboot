package com.bernd.game;

import com.bernd.util.BoardUpdate;
import java.util.function.Function;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;
import static com.bernd.game.Board.REMOVED;
import static com.bernd.game.Board.TERRITORY;

public class Toggle {

  private static Function<int[][], int[][]> toggleRemoved(
      int[][] board,
      int xx,
      int yy) {
    int color = board[yy][xx];
    if ((color & TERRITORY) != 0) {
      return BoardUpdate.identity();
    }
    if (color == 0) {
      return BoardUpdate.identity();
    }
    int toggleColor = color ^ REMOVED;
    int dim = board.length;
    BoardUpdate result = BoardUpdate.builder(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      result.add(x, y, toggleColor);
      if (y > 0) {
        int c = board[y - 1][x];
        if (c == color && !pointsChecked.has(x, y - 1)) {
          pointsChecked.add(x, y - 1);
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int c = board[y + 1][x];
        if (c == color && !pointsChecked.has(x, y + 1)) {
          pointsChecked.add(x, y + 1);
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int c = board[y][x - 1];
        if (c == color && !pointsChecked.has(x - 1, y)) {
          pointsChecked.add(x - 1, y);
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int c = board[y][x + 1];
        if (c == color && !pointsChecked.has(x + 1, y)) {
          pointsChecked.add(x + 1, y);
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    return result;
  }

  public static int[][] toggleStonesAt(
      int[][] board, int x, int y) {
    Function<int[][], int[][]> update = toggleRemoved(board, x, y);
    return update.apply(board);
  }

  public static int[][] resetCounting(
      int[][] board) {
    int dim = board.length;
    BoardUpdate update = BoardUpdate.builder(dim);
    for (int y = 0; y < dim; y++) {
      for (int x = 0; x < board[y].length; x++) {
        int color = board[y][x];
        if ((color & REMOVED) != 0) {
          color = color ^ (B | W);
          color &= ~REMOVED;
          color &= ~TERRITORY;
        }
        if ((color & TERRITORY) != 0) {
          color = 0;
        }
        update.add(x, y, color);
      }
    }
    return update.apply(board);
  }
}
