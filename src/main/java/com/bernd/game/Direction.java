package com.bernd.game;

public enum Direction {
  NORTH(0, -1),
  SOUTH(0, 1),
  WEST(-1, 0),
  EAST(1, 0),
  NONE(0, 0),
  ;
  private final int inc_x;
  private final int inc_y;

  Direction(int inc_x, int inc_y) {
    this.inc_x = inc_x;
    this.inc_y = inc_y;
  }

  boolean isOpposite(Direction other) {
    return inc_x + other.inc_x == 0 && inc_y + other.inc_y == 0;
  }

  Direction oppositeDirection() {
    return switch (this) {
      case EAST -> WEST;
      case WEST -> EAST;
      case NORTH -> SOUTH;
      case SOUTH -> NORTH;
      case NONE -> NONE;
    };
  }

  public int moveX(int xx) {
    return xx + inc_x;
  }

  public int moveY(int yy) {
    return yy + inc_y;
  }
}
