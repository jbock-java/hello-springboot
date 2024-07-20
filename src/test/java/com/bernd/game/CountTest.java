package com.bernd.game;

import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class CountTest {

  private static final int C = B + TERRITORY;
  private static final int X = W + TERRITORY;

  @Test
  void testRemoveOneStone() {
    int[][] position = new int[][]{
        new int[]{B, B, B},
        new int[]{B, W, W},
        new int[]{B, B, W},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{B, B, B},
        new int[]{B, W, W},
        new int[]{B, B, W},
    }, result);
  }

  @Test
  void testCountBlackTerritory() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, B, B, B, 0},
        new int[]{0, B, 0, B, 0},
        new int[]{0, B, B, B, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{C, C, C, C, C},
        new int[]{C, B, B, B, C},
        new int[]{C, B, C, B, C},
        new int[]{C, B, B, B, C},
        new int[]{C, C, C, C, C},
    }, result);
  }

  @Test
  void testCountFull() {
    int[][] position = new int[][]{
        new int[]{0, 0, 0, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{C, C, C, C},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{X, X, X, X},
    }, result);
  }

  @Test
  void testCountPartial() {
    int[][] position = new int[][]{
        new int[]{0, W, 0, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{0, W, 0, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{X, X, X, X},
    }, result);
  }
}
