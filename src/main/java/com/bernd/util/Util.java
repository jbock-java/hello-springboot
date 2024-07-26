package com.bernd.util;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED_B;
import static com.bernd.game.Board.REMOVED_W;
import static com.bernd.game.Board.TERRITORY_B;
import static com.bernd.game.Board.TERRITORY_W;
import static com.bernd.game.Board.W;

public final class Util {
  public static final int COLORS = B | W;
  public static final int MARKERS = ~COLORS;
  public static final int ANY_REMOVED = REMOVED_B | REMOVED_W;
  public static final int ANY_STONE = COLORS | ANY_REMOVED;
  public static final int ANY_B = REMOVED_B | B;
  public static final int ANY_W = REMOVED_W | W;
  public static final int ANY_TERRITORY = TERRITORY_B | TERRITORY_W;

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

  public static int unremove(int color) {
    if ((color & REMOVED_B) != 0) {
      return (color & ~REMOVED_B) | B;
    }
    if ((color & REMOVED_W) != 0) {
      return (color & ~REMOVED_W) | W;
    }
    return color;
  }

  public static int toggleRemoved(int color) {
    if ((color & ANY_B) != 0) {
      return (color & REMOVED_B) != 0 ? B : REMOVED_B;
    }
    if ((color & ANY_W) != 0) {
      return (color & REMOVED_W) != 0 ? W : REMOVED_W;
    }
    return color;
  }

  public static int getBaseColor(int color) {
    if ((color & (B | REMOVED_B)) != 0) {
      return B;
    }
    if ((color & (W | REMOVED_W)) != 0) {
      return W;
    }
    if ((color & TERRITORY_B) != 0) {
      return B;
    }
    if ((color & TERRITORY_W) != 0) {
      return W;
    }
    return 0;
  }

  public static int getTerritory(int color) {
    if ((color & B) != 0) {
      return TERRITORY_B;
    }
    if ((color & W) != 0) {
      return TERRITORY_W;
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
