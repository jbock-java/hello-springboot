package com.bernd.game;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class RemoveTest {

  @Test
  void testRemoveTwoStones() {
    int[][] position = new int[][]{
        new int[]{0, 4, 4, 0},
        new int[]{2, 2, 2, 2},
        new int[]{4, 4, 4, 4},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Remove.removeStonesAt(position, 1, 0);
    assertArrayEquals(new int[][]{
        new int[]{0, 0, 0, 0},
        new int[]{2, 2, 2, 2},
        new int[]{4, 4, 4, 4},
        new int[]{0, 0, 0, 0},
    }, result);
  }
}
