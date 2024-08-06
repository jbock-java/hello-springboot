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

  public GameMove toGameMove(boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, false);
  }

  public GameMove gameEnd(boolean counting) {
    return new GameMove(n, color, pass, x, y, counting, resetCounting, true);
  }

  public Move withColor(int color) {
    return new Move(id, color, n, pass, resetCounting, agreeCounting, x, y);
  }

  public Move withMoveNumber(int n) {
    return new Move(id, color, n, pass, resetCounting, agreeCounting, x, y);
  }
}
