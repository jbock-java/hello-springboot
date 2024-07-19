package com.bernd.game;

import com.bernd.util.BoardFunction;
import com.bernd.util.BoardFunctionImpl;
import com.bernd.util.BoardUpdater;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Board {

  public static final int BLACK = 2;
  public static final int BLACK_TERRITORY = 3;
  public static final int WHITE = 4;
  public static final int WHITE_TERRITORY = 5;

  public static StoneGroup getStoneGroup(
      String[][] board,
      int x,
      int y) {
    String color = board[y][x];
    if (color.isEmpty()) {
      return null;
    }
    int size = board.length;
    int id = y * size + x;
    List<Point> points = new ArrayList<>();
    int liberties = 0;
    Set<Integer> pointsChecked = new HashSet<>();
    pointsChecked.add(id);
    List<Point> pointsToCheck = new ArrayList<>();
    pointsToCheck.add(new Point(x, y));
    while (!pointsToCheck.isEmpty()) {
      Point pt = pop(pointsToCheck);
      int ptId = pt.y() * size + pt.x();
      id = Math.min(id, ptId);
      points.add(pt);
      if (pt.y() > 0) {
        String bpt = board[pt.y() - 1][pt.x()];
        int bptId = (pt.y() - 1) * size + pt.x();
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x(), pt.y() - 1));
        }
      }
      if (pt.y() < size - 1) {
        String bpt = board[pt.y() + 1][pt.x()];
        int bptId = (pt.y() + 1) * size + pt.x();
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x(), pt.y() + 1));
        }
      }
      if (pt.x() > 0) {
        String bpt = board[pt.y()][pt.x() - 1];
        int bptId = pt.y() * size + pt.x() - 1;
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x() - 1, pt.y()));
        }
      }
      if (pt.x() < size - 1) {
        String bpt = board[pt.y()][pt.x() + 1];
        int bptId = pt.y() * size + pt.x() + 1;
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x() + 1, pt.y()));
        }
      }
    }
    return new StoneGroup(
        id,
        color,
        points,
        liberties);
  }

  public static String[][] removeDeadStonesAround(
      String[][] board,
      int x,
      int y) {
    String color = board[y][x];
    if (color.isEmpty()) {
      return board;
    }
    String oppositeColor = color.equals("w") ? "b" : "w";
    int size = board.length;
    Map<Integer, StoneGroup> groups = new LinkedHashMap<>(8);

    // Above
    if (y > 0) {
      StoneGroup group = getStoneGroup(board, x, y - 1);
      if (group != null && group.color().equals(oppositeColor) && group.liberties() == 0) {
        groups.put(group.id(), group);
      }
    }
    // Below
    if (y < size - 1) {
      StoneGroup group = getStoneGroup(board, x, y + 1);
      if (group != null &&
          group.color().equals(oppositeColor) &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }
    // Left
    if (x > 0) {
      StoneGroup group = getStoneGroup(board, x - 1, y);
      if (group != null &&
          group.color().equals(oppositeColor) &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }
    // Right
    if (x < size - 1) {
      StoneGroup group = getStoneGroup(board, x + 1, y);
      if (group != null &&
          group.color().equals(oppositeColor) &&
          group.liberties() == 0 &&
          !groups.containsKey(group.id())) {
        groups.put(group.id(), group);
      }
    }

    if (groups.isEmpty()) {
      return board;
    }
    BoardFunction remove = removeStonesIn(groups.values());
    return BoardUpdater.apply(board, remove);
  }

  private static BoardFunction removeStonesIn(Collection<StoneGroup> groups) {
    BoardFunctionImpl result = BoardFunctionImpl.create(9);
    for (StoneGroup group : groups) {
      for (Point point : group.points()) {
        result.put(point, "");
      }
    }
    return result;
  }

  private static Point pop(List<Point> points) {
    Point result = points.get(points.size() - 1);
    points.remove(points.size() - 1);
    return result;
  }
}
