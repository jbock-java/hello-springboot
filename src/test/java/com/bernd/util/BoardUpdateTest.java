package com.bernd.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BoardUpdateTest {

  @Test
  void testAdd() {
    BoardUpdate update = BoardUpdate.builder(9);
    update.add(1, 8);
    update.add(2, 3);
    assertEquals(2, update.size());
    assertEquals(1, update.x(0));
    assertEquals(8, update.y(0));
    assertEquals(2, update.x(1));
    assertEquals(3, update.y(1));
  }

  @Test
  void testGrow() {
    BoardUpdate update = BoardUpdate.builder(9);
    for (int i = 0; i < 9; i++) {
      update.add(i, 0);
    }
    for (int i = 0; i < 9; i++) {
      update.add(i, 1);
    }
    for (int i = 0; i < 9; i++) {
      update.add(i, 2);
    }
    assertEquals(27, update.size());
    for (int i = 0; i < 9; i++) {
      assertEquals(i % 9, update.x(i));
      assertEquals(0, update.y(i));
    }
    for (int i = 10; i < 18; i++) {
      assertEquals(i % 9, update.x(i));
      assertEquals(1, update.y(i));
    }
    for (int i = 19; i < 27; i++) {
      assertEquals(i % 9, update.x(i));
      assertEquals(2, update.y(i));
    }
  }
}
