package com.bernd.model;

public record Move(
    String id,
    int color,
    int n,
    boolean pass,
    boolean resetCounting,
    boolean agreeCounting,
    int x,
    int y) {

  public GameMove toView(boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, false);
  }

  public GameMove gameEnd(boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, true);
  }
}
