package com.bernd.game;

import com.bernd.model.Move;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoveListTest {

  @Test
  void testGet() {
    MoveList list = MoveList.create(9);
    list.add(Board.B, move(0, 1), false);
    list.add(Board.W, move(2, 3), false);
    assertEquals(2, list.size());
    assertEquals(0, list.get(0).x());
    assertEquals(1, list.get(0).y());
    assertEquals(Board.B, list.get(0).color());
    assertEquals(2, list.get(1).x());
    assertEquals(3, list.get(1).y());
    assertEquals(Board.W, list.get(1).color());
  }

  @Test
  void testGrow() {
    MoveList list = MoveList.create(9);
    for (int y = 0; y < 9; y++) {
      for (int x = 0; x < 9; x++) {
        list.add(Board.B, move(x, y), false);
      }
    }
    assertEquals(81, list.size());
  }

  private Move move(int x, int y) {
    return new Move("", 0, false, false, false, x, y);
  }
}
