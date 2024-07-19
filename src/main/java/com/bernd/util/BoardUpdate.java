package com.bernd.util;

import com.bernd.game.Point;
import java.util.Arrays;
import java.util.function.Function;

public class BoardUpdate implements Function<int[][], int[][]> {

  private int pos;
  private final int dim;
  private final int[] updates;

  private BoardUpdate(
      int dim,
      int[] updates) {
    this.dim = dim;
    this.updates = updates;
  }

  public static BoardUpdate builder(int dim, int size) {
    return new BoardUpdate(dim, new int[2 * size]);
  }

  public static Function<int[][], int[][]> create(
      int dim, int x, int y, int value) {
    BoardUpdate result = builder(dim, 1);
    result.add(x, y, value);
    return result;
  }

  public void add(int x, int y, int value) {
    int base = 2 * pos;
    updates[base] = dim * y + x;
    updates[base + 1] = value;
    pos++;
  }

  public void add(Point point, int value) {
    add(point.x(), point.y(), value);
  }

  @Override
  public int[][] apply(int[][] board) {
    int[][] result = Arrays.copyOf(board, board.length);
    int size = updates.length / 2;
    for (int i = 0; i < size; i++) {
      int x = updates[2 * i] % dim;
      int y = updates[2 * i] / dim;
      int value = updates[2 * i + 1];
      if (result[y] == board[y]) {
        result[y] = Arrays.copyOf(board[y], board[y].length);
      }
      result[y][x] = value;
    }
    return result;
  }
}
