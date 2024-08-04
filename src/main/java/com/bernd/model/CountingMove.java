package com.bernd.model;

public record CountingMove(
    int n,
    int color,
    boolean pass,
    boolean counting,
    boolean resetCounting,
    int[][] board) {

  public static CountingMove create(int color, int n, boolean reset, int[][] board) {
    return new CountingMove(n, color, true, true, reset, board);
  }
}
