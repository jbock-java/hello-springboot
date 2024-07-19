package com.bernd.game;

public class Count {

  private static int getImpliedColor(
      int[][] board,
      int xx,
      int yy) {
    if (board[yy][xx] != 0) {
      return board[yy][xx];
    }
    int dim = board.length;
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      if (board[y][x] != 0) {
        return board[y][x] + 1; // add territory flag
      }
      if (y > 0) {
        pointsToCheck.offer(x, y - 1);
      }
      if (y < dim - 1) {
        pointsToCheck.offer(x, y + 1);
      }
      if (x > 0) {
        pointsToCheck.offer(x - 1, y);
      }
      if (x < dim - 1) {
        pointsToCheck.offer(x + 1, y);
      }
    }
    throw new RuntimeException("empty board");
  }

  private static void getStoneGroup(
      int[][] acc,
      int[][] board,
      int xx,
      int yy) {
    int color = getImpliedColor(board, xx, yy);
    if (color % 2 == 0) {
      acc[yy][xx] = color;
      return;
    }
    int baseColor = color - 1; // remove territory flag
    int dim = board.length;
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(xx, yy);
    while (!pointsToCheck.isEmpty()) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      acc[y][x] = color;
      if (y > 0) {
        int c = board[y - 1][x];
        if (c != 0 && c != baseColor) {
          throw new RuntimeException("remove dead stones");
        }
        if (c == 0 && acc[y - 1][x] != color) {
          pointsToCheck.offer(x, y - 1);
        }
      }
      if (y < dim - 1) {
        int c = board[y + 1][x];
        if (c != 0 && c != baseColor) {
          throw new RuntimeException("remove dead stones");
        }
        if (c == 0 && acc[y + 1][x] != color) {
          pointsToCheck.offer(x, y + 1);
        }
      }
      if (x > 0) {
        int c = board[y][x - 1];
        if (c != 0 && c != baseColor) {
          throw new RuntimeException("remove dead stones");
        }
        if (c == 0 && acc[y][x - 1] != color) {
          pointsToCheck.offer(x - 1, y);
        }
      }
      if (x < dim - 1) {
        int c = board[y][x + 1];
        if (c != 0 && c != baseColor) {
          throw new RuntimeException("remove dead stones");
        }
        if (c == 0 && acc[y][x + 1] != color) {
          pointsToCheck.offer(x + 1, y);
        }
      }
    }
  }

  public static int[][] count(
      int[][] board) {
    int[][] acc = createAcc(board);
    for (int y = 0; y < board.length; y++) {
      int[] row = board[y];
      for (int x = 0; x < row.length; x++) {
        if (acc[y][x] == 0) {
          getStoneGroup(acc, board, x, y);
        }
      }
    }
    return acc;
  }

  private static int[][] createAcc(int[][] board) {
    int[][] result = new int[board.length][];
    for (int i = 0; i < board.length; i++) {
      result[i] = new int[result.length];
    }
    return result;
  }
}
