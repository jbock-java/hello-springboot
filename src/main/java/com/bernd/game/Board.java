package com.bernd.game;

import java.util.*;

public class Board {

  public static StoneGroup getStoneGroup(
      List<List<String>> board,
      int x,
      int y) {
    String color = board.get(y).get(x);
    if (color.isEmpty()) {
      return null;
    }
    int size = board.size();
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
      if (ptId < id) {
        id = ptId;
      }
      points.add(pt);
      if (pt.y() > 0) {
        String bpt = board.get(pt.y() - 1).get(pt.x());
        int bptId = (pt.y() - 1) * size + pt.x();
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x(), pt.y() - 1));
        }
      }
      if (pt.y() < size - 1) {
        String bpt = board.get(pt.y() + 1).get(pt.x());
        int bptId = (pt.y() + 1) * size + pt.x();
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x(), pt.y() + 1));
        }
      }
      if (pt.x() > 0) {
        String bpt = board.get(pt.y()).get(pt.x() - 1);
        int bptId = pt.y() * size + pt.x() - 1;
        if (bpt.isEmpty()) {
          liberties++;
        } else if (bpt.equals(color) && !pointsChecked.contains(bptId)) {
          pointsChecked.add(bptId);
          pointsToCheck.add(new Point(pt.x() - 1, pt.y()));
        }
      }
      if (pt.x() < size - 1) {
        String bpt = board.get(pt.y()).get(pt.x() + 1);
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


  public static List<List<String>> removeDeadStonesAround(List<List<String>> board, int x, int y) {
    String color = board.get(y).get(x);
    if (color.isEmpty()) {
      return board;
    }
    String oppositeColor = color.equals("w") ? "b" : "w";
    int size = board.size();
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
    Set<Point> points = points(groups.values());
    List<List<String>> newBoard = new ArrayList<>(9);
    for (int _y = 0; _y < board.size(); _y++) {
      List<String> row = board.get(_y);
      String[] newRow = new String[row.size()];
      for (int _x = 0; _x < board.size(); _x++) {
        if (points.contains(new Point(_x, _y))) { // TODO inefficient
          newRow[_x] = "";
        } else {
          newRow[_x] = row.get(_x);
        }
      }
      newBoard.add(List.of(newRow));
    }
    return newBoard;
  }

  private static Set<Point> points(Collection<StoneGroup> groups) {
    Set<Point> result = new HashSet<>();
    for (StoneGroup group : groups) {
      result.addAll(group.points());
    }
    return result;
  }

  private static Point pop(List<Point> points) {
    Point result = points.get(points.size() - 1);
    points.remove(points.size() - 1);
    return result;
  }
}
