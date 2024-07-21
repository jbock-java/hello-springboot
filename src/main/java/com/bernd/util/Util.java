package com.bernd.util;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED;
import static com.bernd.game.Board.W;

public final class Util {
  private static final int MARKERS = ~B & ~W;

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
    return color == 0 || (color & REMOVED) != 0;
  }

  public static int keepMarkers(int color, int colorWithMarkers) {
    return color | colorWithMarkers & MARKERS;
  }

  public static int divUp(int i, int div) {
    return i % div == 0 ? i / div : (i / div) + 1;
  }
}
