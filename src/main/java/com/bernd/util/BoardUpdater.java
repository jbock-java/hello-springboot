package com.bernd.util;

import java.util.ArrayList;
import java.util.List;

public class BoardUpdater {

  public static List<List<String>> apply(
      List<List<String>> board,
      BoardFunction function
  ) {
    List<List<String>> result = new ArrayList<>(board.size());
    for (int y = 0; y < board.size(); y++) {
      List<String> row = board.get(y);
      List<String> newRow = row;
      for (int x = 0; x < board.size(); x++) {
        String value = function.apply(x, y);
        if (value != null) {
          if (newRow == row) {
            newRow = new ArrayList<>(row);
          }
          newRow.set(x, value);
        }
      }
      result.add(newRow);
    }
    return result;
  }
}
