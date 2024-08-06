package com.bernd.model;

public record Move(
    String id,
    int n,
    boolean pass,
    boolean resetCounting,
    boolean agreeCounting,
    int x,
    int y) {

  public GameMove toView(int color, boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, false);
  }

  public GameMove gameEnd(int color, boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, true);
  }
}
