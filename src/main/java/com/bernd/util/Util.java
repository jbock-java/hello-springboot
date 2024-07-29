package com.bernd.util;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED_B;
import static com.bernd.game.Board.REMOVED_W;
import static com.bernd.game.Board.TERRITORY_B;
import static com.bernd.game.Board.TERRITORY_W;
import static com.bernd.game.Board.W;

public final class Util {
  public static final int COLORS = B | W;
  private static final int TOGGLE_B = REMOVED_B | B;
  private static final int TOGGLE_W = REMOVED_W | W;
  public static final int TOGGLE = TOGGLE_B | TOGGLE_W;
  public static final int TERRITORY = TERRITORY_B | TERRITORY_W;

  private Util() {
  }

  public static String boardToString(int[][] board) {
    StringBuilder sb = new StringBuilder("int[][] position = new int[][]{\n");
    for (int[] row : board) {
      sb.append("  new int[]{");
      for (int i : row) {
        sb.append(String.format("%d, ", i));
      }
      sb.append("},\n");
    }
    sb.append("};");
    return sb.toString();
  }

  public static boolean isEmpty(int color) {
    return (color & COLORS) == 0;
  }

  public static int resurrect(int color) {
    if ((color & REMOVED_B) != 0) {
      return color ^ TOGGLE_B;
    }
    if ((color & REMOVED_W) != 0) {
      return color ^ TOGGLE_W;
    }
    return color;
  }

  public static int toggleRemoved(int color) {
    if ((color & TOGGLE_B) != 0) {
      return color ^ TOGGLE_B;
    }
    if ((color & TOGGLE_W) != 0) {
      return color ^ TOGGLE_W;
    }
    return color;
  }

  public static int asTerritory(int color) {
    if (color == B) {
      return TERRITORY_B;
    }
    if (color == W) {
      return TERRITORY_W;
    }
    return color;
  }

  public static int asRemoved(int color) {
    if (color == B) {
      return REMOVED_B;
    }
    if (color == W) {
      return REMOVED_W;
    }
    return color;
  }

  public static int divUp(int i, int div) {
    return i % div == 0 ? i / div : (i / div) + 1;
  }

  public static boolean isStone(int color) {
    return (color & COLORS) != 0;
  }
}
