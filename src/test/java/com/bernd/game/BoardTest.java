package com.bernd.game;

import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class BoardTest {

  @Test
  void testRemoveOneStone() {
    int[][] position = new int[][]{
        new int[]{B, W},
        new int[]{W, 0},
    };
    int[][] result = Board.removeDeadStonesAround(position, 0, 1);
    assertArrayEquals(new int[][]{
        new int[]{0, W},
        new int[]{W, 0},
    }, result);
  }

  @Test
  void testRemoveFourStones() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, B, B, 0},
        new int[]{0, B, W, W, B},
        new int[]{B, W, W, B, 0},
        new int[]{0, B, B, 0, 0},
    };
    int[][] result = Board.removeDeadStonesAround(position, 4, 2);
    assertArrayEquals(new int[][]{
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, B, B, 0},
        new int[]{0, B, 0, 0, B},
        new int[]{B, 0, 0, B, 0},
        new int[]{0, B, B, 0, 0},
    }, result);
  }

  @Test
  void testRemoveStones() {
    int[][] position = new int[][]{
        new int[]{W, B, 0, 0, 0},
        new int[]{B, W, 0, 0, 0},
        new int[]{B, W, 0, 0, 0},
        new int[]{W, B, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] result = Board.removeDeadStonesAround(position, 0, 0);
    assertArrayEquals(new int[][]{
        new int[]{W, B, 0, 0, 0},
        new int[]{0, W, 0, 0, 0},
        new int[]{0, W, 0, 0, 0},
        new int[]{W, B, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, result);
  }
}
