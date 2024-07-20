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

  @Test
  void testMarkBig() {
    int[][] position = {
        new int[]{B, 0, B, B, B, W, 0, 0, 0},
        new int[]{B, B, B, W, W, B, 0, 0, 0},
        new int[]{W, W, W, W, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
    };
    int[][] acc = Count.createAcc(position);
    acc[0] = new int[]{B, C, B, B, B, W, -1, -1, -1};
    acc[1] = new int[]{B, B, B, W, W, B, -1, -1, -1};
    acc[2] = new int[]{W, W, W, W, -1, -1, -1, -1, -1};
    Count.markStonesAround(acc, position, 6, 0);
    assertArrayEquals(new int[][]{
        new int[]{B, C, B, B, B, W, 0, 0, 0},
        new int[]{B, B, B, W, W, B, 0, 0, 0},
        new int[]{W, W, W, W, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
    }, acc);
  }

  @Test
  void testMarkSmall() {
    int[][] position = {
        new int[]{B, 0, B, B, B, W, 0, 0, 0},
        new int[]{B, B, B, W, W, B, 0, 0, 0},
        new int[]{W, W, W, W, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
    };
    int[][] acc = Count.createAcc(position);
    acc[0][0] = B;
    Count.markStonesAround(acc, position, 1, 0);
    assertArrayEquals(new int[]{B, C, -1, -1, -1, -1, -1, -1, -1}, acc[0]);
  }

  @Test
  void testCountLargeArea() {
    int[][] position = {
        new int[]{B, 0, B, B, B, W, 0, 0, 0},
        new int[]{B, B, B, W, W, B, 0, 0, 0},
        new int[]{W, W, W, W, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
    };
    int[][] result = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{B, C, B, B, B, W, 0, 0, 0},
        new int[]{B, B, B, W, W, B, 0, 0, 0},
        new int[]{W, W, W, W, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0, 0, 0, 0, 0},
    }, result);
  }
}
