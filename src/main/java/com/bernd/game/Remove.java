package com.bernd.game;

import com.bernd.util.BoardUpdate;
import java.util.ArrayList;
import java.util.List;

public class Remove {

  private static List<Point> findGroup(
      int[][] board,
      int xx,
      int yy) {
    int color = board[yy][xx];
    if (color == 0) {
      return List.of();
    }
    int dim = board.length;
    PointQueue pointsToCheck = PointQueue.create(dim);
    PointSet pointsChecked = PointSet.create(dim);
    pointsChecked.add(xx, yy);
    pointsToCheck.offer(xx, yy);
    List<Point> result = new ArrayList<>();
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      result.add(new Point(x, y));
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

  public static int[][] removeStonesAt(
      int[][] board, int x, int y) {
    List<Point> group = findGroup(board, x, y);
    if (group.isEmpty()) {
      return board;
    }
    BoardUpdate update = BoardUpdate.builder(board.length, group.size());
    for (Point point : group) {
      update.add(point, 0);
    }
    return update.apply(board);
  }
}
