package com.bernd.util;

import java.util.Arrays;
import java.util.function.Function;

public final class BoardUpdate implements Function<int[][], int[][]> {

  private static final int LO = 0xffff;

  private int pos;
  private final int dim;
  private int[] updates;

  private BoardUpdate(
      int dim,
      int[] updates) {
    this.dim = dim;
    this.updates = updates;
  }

  public static BoardUpdate builder(int dim, int size) {
    return new BoardUpdate(dim, new int[size]);
  }

  public static BoardUpdate builder(int dim) {
    return new BoardUpdate(dim, new int[16]);
  }

  public static Function<int[][], int[][]> create(
      int dim, int x, int y, int value) {
    BoardUpdate result = builder(dim, 1);
    result.add(x, y, value);
    return result;
  }

  public static Function<int[][], int[][]> identity() {
    return Function.identity();
  }

  public void add(int x, int y, int value) {
    if (pos >= updates.length) {
      updates = Arrays.copyOf(updates, dim * dim);
    }
    int ptId = dim * y + x;
    updates[pos] = (value << 16) | ptId;
    pos++;
  }

  public void add(int x, int y) {
    add(x, y, 0);
  }

  public int x(int i) {
    int code = updates[i];
    int ptId = code & LO;
    return ptId % dim;
  }

  public int y(int i) {
    int code = updates[i];
    int ptId = code & LO;
    return ptId / dim;
  }

  public int size() {
    return pos;
  }

  @Override
  public int[][] apply(int[][] board) {
    int[][] result = Arrays.copyOf(board, board.length);
    for (int i = 0; i < pos; i++) {
      int code = updates[i];
      int value = code >> 16;
      int ptId = code & LO;
      int x = ptId % dim;
      int y = ptId / dim;
      if (result[y] == board[y]) {
        result[y] = Arrays.copyOf(board[y], board[y].length);
      }
      result[y][x] = value;
    }
    return result;
  }
}
