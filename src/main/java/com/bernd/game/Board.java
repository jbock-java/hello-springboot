package com.bernd.game;

import com.bernd.util.BoardUpdate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class Board {

  public static final int BLACK = 2;
  public static final int WHITE = 4;

  public static StoneGroup getStoneGroup(
      int[][] board,
      int xx,
      int yy) {
    int color = board[yy][xx];
    if (color == 0) {
      return null;
    }
    int dim = board.length;
    int id = yy * dim + xx;
    List<Point> points = new ArrayList<>();
    int liberties = 0;
    boolean[] pointsChecked = new boolean[dim * dim];
    pointsChecked[id] = true;
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      id = Math.min(id, ptId);
      points.add(new Point(x, y));
      if (y > 0) {
        int bpt = board[y - 1][x];
        int bptId = (y - 1) * dim + x;
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked[bptId]) {
          pointsChecked[bptId] = true;
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int bpt = board[y + 1][x];
        int bptId = (y + 1) * dim + x;
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked[bptId]) {
          pointsChecked[bptId] = true;
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int bpt = board[y][x - 1];
        int bptId = y * dim + x - 1;
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked[bptId]) {
          pointsChecked[bptId] = true;
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int bpt = board[y][x + 1];
        int bptId = y * dim + x + 1;
        if (bpt == 0) {
          liberties++;
        } else if (bpt == color && !pointsChecked[bptId]) {
          pointsChecked[bptId] = true;
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
    return new StoneGroup(
        id,
        color,
        points,
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
    int oppositeColor = color == WHITE ? BLACK : WHITE;
    int size = board.length;
    Map<Integer, StoneGroup> groups = new LinkedHashMap<>(8);

    // Above
    if (y > 0) {
      StoneGroup group = getStoneGroup(board, x, y - 1);
      if (group != null && group.color() == oppositeColor && group.liberties() == 0) {
        groups.put(group.id(), group);
      }
    }
    // Below
    if (y < size - 1) {
      StoneGroup group = getStoneGroup(board, x, y + 1);
      if (group != null &&
          group.color() == oppositeColor &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }
    // Left
    if (x > 0) {
      StoneGroup group = getStoneGroup(board, x - 1, y);
      if (group != null &&
          group.color() == oppositeColor &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }
    // Right
    if (x < size - 1) {
      StoneGroup group = getStoneGroup(board, x + 1, y);
      if (group != null &&
          group.color() == oppositeColor &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }

    if (groups.isEmpty()) {
      return board;
    }
    Function<int[][], int[][]> update = removeStonesIn(board.length, groups.values());
    return update.apply(board);
  }

  private static Function<int[][], int[][]> removeStonesIn(
      int dim,
      Collection<StoneGroup> groups) {
    int size = 0;
    for (StoneGroup group : groups) {
      size += group.points().size();
    }
    BoardUpdate update = BoardUpdate.builder(dim, size);
    for (StoneGroup group : groups) {
      for (Point point : group.points()) {
        update.add(point, 0);
      }
    }
    return update;
  }
}
