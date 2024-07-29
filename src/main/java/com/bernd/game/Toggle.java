package com.bernd.game;

import com.bernd.util.BoardUpdateImpl;

import static com.bernd.util.Util.COLORS;
import static com.bernd.util.Util.TOGGLE;
import static com.bernd.util.Util.resurrect;
import static com.bernd.util.Util.toggleRemoved;

public class Toggle {

  public static int[][] toggleStonesAt(
      int[][] board,
      int xx,
      int yy) {
    int color = board[yy][xx];
    if ((color & TOGGLE) == 0) {
      return board;
    }
    int dim = board.length;
    BoardUpdateImpl result = BoardUpdateImpl.builder(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      result.add(x, y, toggleRemoved(color));
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
    return result.apply(board);
  }

  public static int[][] resetCounting(
      int[][] board) {
    int dim = board.length;
    BoardUpdateImpl update = BoardUpdateImpl.builder(dim);
    for (int y = 0; y < dim; y++) {
      for (int x = 0; x < board[y].length; x++) {
        int color = resurrect(board[y][x]) & COLORS;
        update.add(x, y, color);
      }
    }
    return update.apply(board);
  }
}
