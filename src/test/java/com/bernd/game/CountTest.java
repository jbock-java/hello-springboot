package com.bernd.game;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CountTest {

  @Test
  void testRemoveOneStone() {
    int[][] position = new int[][]{
        new int[]{2, 2, 2},
        new int[]{2, 4, 4},
        new int[]{2, 2, 4},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{2, 2, 2},
        new int[]{2, 4, 4},
        new int[]{2, 2, 4},
    }, result);
  }

  @Test
  void testCountBlackTerritory() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 2, 2, 2, 0},
        new int[]{0, 2, 0, 2, 0},
        new int[]{0, 2, 2, 2, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{3, 3, 3, 3, 3},
        new int[]{3, 2, 2, 2, 3},
        new int[]{3, 2, 3, 2, 3},
        new int[]{3, 2, 2, 2, 3},
        new int[]{3, 3, 3, 3, 3},
    }, result);
  }

  @Test
  void testCountMixed() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0},
        new int[]{2, 2, 2, 2},
        new int[]{4, 4, 4, 4},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{3, 3, 3, 3},
        new int[]{2, 2, 2, 2},
        new int[]{4, 4, 4, 4},
        new int[]{5, 5, 5, 5},
    }, result);
  }

  @Test
  void testRemoveDead() {
    int[][] position = new int[][]{
        new int[]{0, 4, 0, 0},
        new int[]{2, 2, 2, 2},
        new int[]{4, 4, 4, 4},
        new int[]{0, 0, 0, 0},
    };
    RuntimeException error = assertThrows(RuntimeException.class,
        () -> Count.count(position));
    assertEquals("remove dead stones", error.getMessage());
  }
}