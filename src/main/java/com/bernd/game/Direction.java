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

  public boolean isOpposite(Direction other) {
    return inc_x + other.inc_x == 0 && inc_y + other.inc_y == 0;
  }

  public static Direction from(int source_x, int source_y, int target_x, int target_y) {
    if (target_x > source_x) {
      return EAST;
    }
    if (target_x < source_x) {
      return WEST;
    }
    if (target_y > source_y) {
      return SOUTH;
    }
    if (target_y < source_y) {
      return NORTH;
    }
    return NONE;
  }

  public int moveX(int x) {
    return x + inc_x;
  }

  public int moveY(int y) {
    return y + inc_y;
  }
}
