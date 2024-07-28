package com.bernd.util;

import java.util.Arrays;

public final class BoardUpdateImpl implements BoardUpdate {

  private static final int LO = 0xffff;

  private static final BoardUpdate IDENTITY = new BoardUpdate() {
    @Override
    public int size() {
      return 0;
    }

    @Override
    public int[][] apply(int[][] board) {
      return board;
    }
  };

  private int pos;
  private final int dim;
  private int[] updates;

  private BoardUpdateImpl(
      int dim,
      int[] updates) {
    this.dim = dim;
    this.updates = updates;
  }

  public static BoardUpdateImpl builder(int dim, int size) {
    return new BoardUpdateImpl(dim, new int[size]);
  }

  public static BoardUpdateImpl builder(int dim) {
    return new BoardUpdateImpl(dim, new int[16]);
  }

  public static BoardUpdateImpl create(
      int dim, int x, int y, int value) {
    BoardUpdateImpl result = builder(dim, 1);
    result.add(x, y, value);
    return result;
  }

  public static BoardUpdate identity() {
    return IDENTITY;
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

  @Override
  public int size() {
    return pos;
  }

  @Override
  public int[][] apply(int[][] board) {
    int[][] result = Arrays.copyOf(board, board.length); // shallow
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
