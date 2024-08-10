package com.bernd.model;

public record Move(
    int color,
    int n,
    boolean pass,
    boolean resetCounting,
    boolean agreeCounting,
    int x,
    int y) {

  public GameMove toGameMove() {
    return new GameMove(n, color, pass, x, y, resetCounting, agreeCounting, false);
  }

  public Move withColor(int color) {
    return new Move(color, n, pass, resetCounting, agreeCounting, x, y);
  }

  public Move withMoveNumber(int n) {
    return new Move(color, n, pass, resetCounting, agreeCounting, x, y);
  }
}
