package com.bernd.util;

import java.util.Arrays;

public class BoardUpdater {

  public static String[][] apply(
      String[][] board,
      BoardFunction function
  ) {
    String[][] result = new String[board.length][];
    for (int y = 0; y < board.length; y++) {
      String[] row = board[y];
      String[] newRow = row;
      for (int x = 0; x < board.length; x++) {
        String value = function.apply(x, y);
        if (value != null) {
          if (newRow == row) {
            newRow = Arrays.copyOf(row, row.length);
          }
          newRow[x] = value;
        }
      }
      result[y] = newRow;
    }
    return result;
  }
}
