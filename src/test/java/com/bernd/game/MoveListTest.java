package com.bernd.game;

import com.bernd.model.Move;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoveListTest {

  @Test
  void get() {
    MoveList list = MoveList.create(9);
    list.add(Board.B, move(0, 1));
    list.add(Board.W, move(2, 3));
    assertEquals(2, list.size());
    assertEquals(0, list.get(0).x());
    assertEquals(1, list.get(0).y());
    assertEquals(Board.B, list.get(0).color());
    assertEquals(2, list.get(1).x());
    assertEquals(3, list.get(1).y());
    assertEquals(Board.W, list.get(1).color());
  }

  private Move move(int x, int y) {
    return new Move("", false, false, x, y);
  }
}