package com.bernd.game;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class BoardTest {

  @Test
  void testRemoveOneStone() {
    int[][] position = new int[][]{
        new int[]{2, 4},
        new int[]{4, 0},
    };
    int[][] result = Board.removeDeadStonesAround(position, 0, 1);
    assertArrayEquals(new int[]{0, 4}, result[0]);
    assertArrayEquals(new int[]{4, 0}, result[1]);
  }

  @Test
  void testRemoveFourStones() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 2, 2, 0},
        new int[]{0, 2, 4, 4, 2},
        new int[]{2, 4, 4, 2, 0},
        new int[]{0, 2, 2, 0, 0},
    };
    int[][] result = Board.removeDeadStonesAround(position, 4, 2);
    assertArrayEquals(new int[]{0, 0, 0, 0, 0}, result[0]);
    assertArrayEquals(new int[]{0, 0, 2, 2, 0}, result[1]);
    assertArrayEquals(new int[]{0, 2, 0, 0, 2}, result[2]);
    assertArrayEquals(new int[]{2, 0, 0, 2, 0}, result[3]);
    assertArrayEquals(new int[]{0, 2, 2, 0, 0}, result[4]);
  }
}