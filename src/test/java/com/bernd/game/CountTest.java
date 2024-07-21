package com.bernd.game;

import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CountTest {

  private static final int b = B + TERRITORY;
  private static final int w = W + TERRITORY;

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
        new int[]{b, b, b, b, b},
        new int[]{b, B, B, B, b},
        new int[]{b, B, b, B, b},
        new int[]{b, B, B, B, b},
        new int[]{b, b, b, b, b},
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
        new int[]{b, b, b, b},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{w, w, w, w},
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
        new int[]{w, w, w, w},
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
    acc[0] = new int[]{B, b, B, B, B, W, -1, -1, -1};
    acc[1] = new int[]{B, B, B, W, W, B, -1, -1, -1};
    acc[2] = new int[]{W, W, W, W, -1, -1, -1, -1, -1};
    Count.markStonesAround(acc, position, 6, 0);
    assertArrayEquals(new int[][]{
        new int[]{B, b, B, B, B, W, 0, 0, 0},
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
    assertArrayEquals(new int[]{B, b, -1, -1, -1, -1, -1, -1, -1}, acc[0]);
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
        new int[]{B, b, B, B, B, W, 0, 0, 0},
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

  @Test
  void testNoBufferOverflow() {
    // fails if the capacity assumption in PointQueue is wrong
    for (int dim = 1; dim < 40; dim++) {
      assertEquals(0, Count.getImpliedColor(
          createEmptyBoard(dim),
          dim / 2,
          dim / 2));
      assertEquals(0, Count.getImpliedColor(
          createEmptyBoard(dim),
          0,
          0));
      assertEquals(0, Count.getImpliedColor(
          createEmptyBoard(dim),
          ThreadLocalRandom.current().nextInt(dim),
          ThreadLocalRandom.current().nextInt(dim)));
    }
  }

  static int[][] createEmptyBoard(int dim) {
    int[][] board = new int[dim][];
    for (int i = 0; i < board.length; i++) {
      board[i] = new int[dim];
    }
    return board;
  }
}
