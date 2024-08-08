package com.bernd.game;

import com.bernd.model.Move;
import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertEquals;

class MoveListTest {

  @Test
  void testGet() {
    MoveList list = MoveList.create(9);
    list.add(move(B, 0, 1));
    list.add(move(W, 2, 3));
    assertEquals(2, list.size());
    assertEquals(0, list.get(0).x());
    assertEquals(1, list.get(0).y());
    assertEquals(B, list.get(0).color());
    assertEquals(2, list.get(1).x());
    assertEquals(3, list.get(1).y());
    assertEquals(W, list.get(1).color());
  }

  @Test
  void testGrow() {
    MoveList list = MoveList.create(9);
    for (int y = 0; y < 9; y++) {
      for (int x = 0; x < 9; x++) {
        list.add(move(B, x, y));
      }
    }
    assertEquals(81, list.size());
  }

  private Move move(int color, int x, int y) {
    return new Move(color, 0, false, false, false, x, y);
  }
}
