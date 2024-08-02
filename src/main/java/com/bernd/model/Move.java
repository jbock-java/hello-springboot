package com.bernd.model;

public record Move(
    String id,
    boolean pass,
    boolean resetCounting,
    int x,
    int y) {

  public GameMove toView(int color, int moveNumber) {
    return new GameMove(moveNumber, color, pass, x, y);
  }
}
