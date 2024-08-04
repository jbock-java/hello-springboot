package com.bernd.model;

public record CountingMove(
    int n,
    int color,
    boolean pass,
    boolean counting,
    int[][] board) {

  public static CountingMove create(int color, int n, int[][] board) {
    return new CountingMove(n, color, true, true, board);
  }
}
