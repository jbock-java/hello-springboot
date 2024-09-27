package com.bernd.model;

public record Move(
    int color,
    int n,
    String action,
    int x,
    int y) {

  public Move toGameMove() {
    return this;
  }

  public Move withColor(int color) {
    return new Move(color, n, action, x, y);
  }

  public Move withCount(int n) {
    return new Move(color, n, action, x, y);
  }

  public boolean agreeCounting() {
    return "agreeCounting".equals(action);
  }

  public boolean resetCounting() {
    return "resetCounting".equals(action);
  }

  public boolean pass() {
    return "pass".equals(action);
  }

  public boolean end() {
    return "end".equals(action);
  }
}
