package com.bernd.util;

public final class Util {
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

  public static int divideUp(int i, int div) {
    return i % div == 0 ? i / div : (i / div) + 1;
  }
}
