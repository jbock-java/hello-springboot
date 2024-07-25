package com.bernd.game;

import com.bernd.util.Util;
import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;
import static com.bernd.game.Count.colorEmptyTerritory;
import static com.bernd.game.Count.getImpliedColor;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CountTest {

  private static final int b = B | TERRITORY;
  private static final int p = B | TERRITORY | REMOVED;
  private static final int w = W | TERRITORY;
  private static final int v = W | REMOVED;

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
        new int[]{0, B, 0, v, 0},
        new int[]{0, B, 0, v, v},
        new int[]{B, B, 0, 0, 0},
        new int[]{0, B, 0, 0, 0},
        new int[]{0, B, 0, 0, 0},
    };
    int[][] acc = createAccWithoutRemovedStones(position);
    colorEmptyTerritory(position, acc, 2, 0);
    assertArrayEquals(new int[][]{
        new int[]{-1, B, b, p, b},
        new int[]{-1, B, b, p, p},
        new int[]{B, B, b, b, b},
        new int[]{-1, B, b, b, b},
        new int[]{-1, B, b, b, b},
    }, acc);
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
    colorEmptyTerritory(position, acc, 6, 0);
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
    colorEmptyTerritory(position, acc, 1, 0);
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
      assertEquals(0, getImpliedColor(
          createEmptyBoard(dim),
          dim / 2,
          dim / 2));
      assertEquals(0, getImpliedColor(
          createEmptyBoard(dim),
          0,
          0));
      assertEquals(0, getImpliedColor(
          createEmptyBoard(dim),
          ThreadLocalRandom.current().nextInt(dim),
          ThreadLocalRandom.current().nextInt(dim)));
    }
  }

  @Test
  void testCornerEyeCount() {
    int b = B | REMOVED;
    int w = W | TERRITORY;
    int k = W | TERRITORY | REMOVED;
    int t = B | TERRITORY;
    int[][] result = Count.count(new int[][]{
        new int[]{t, b, W, 0, 0},
        new int[]{b, b, W, 0, 0},
        new int[]{W, W, W, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    });
    assertArrayEquals(new int[][]{
        new int[]{w, k, W, 0, 0},
        new int[]{k, k, W, 0, 0},
        new int[]{W, W, W, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, result);
  }

  @Test
  void testCornerEyeCountImpliedColor() {
    int b = B | REMOVED;
    int t = B | TERRITORY;
    int[][] board = {
        new int[]{t, b, W},
        new int[]{b, b, W},
        new int[]{W, W, W},
    };
    assertEquals(W | TERRITORY, getImpliedColor(board, 0, 0));
    assertEquals(W | TERRITORY, getImpliedColor(board, 0, 1));
    assertEquals(W | TERRITORY, getImpliedColor(board, 1, 0));
    assertEquals(W | TERRITORY, getImpliedColor(board, 1, 1));
  }

  @Test
  void testCountWhiteL() {
    int r = W | REMOVED;
    int f = B | REMOVED | TERRITORY;
    int t = B | TERRITORY;
    int[][] result = Count.count(new int[][]{
        new int[]{t, B, r, 0, 0},
        new int[]{B, B, r, 0, 0},
        new int[]{r, r, r, 0, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    });
    assertArrayEquals(new int[][]{
        new int[]{t, B, f, t, t},
        new int[]{B, B, f, t, t},
        new int[]{f, f, f, t, t},
        new int[]{t, t, t, t, t},
        new int[]{t, t, t, t, t},
    }, result);
  }

  static int[][] createEmptyBoard(int dim) {
    int[][] board = new int[dim][];
    for (int y = 0; y < dim; y++) {
      board[y] = new int[dim];
    }
    return board;
  }

  private static int[][] createAccWithoutRemovedStones(int[][] board) {
    int[][] result = new int[board.length][];
    for (int y = 0; y < board.length; y++) {
      result[y] = Arrays.copyOf(board[y], board[y].length);
      for (int x = 0; x < result[y].length; x++) {
        if (Util.isEmpty(result[y][x])) {
          result[y][x] = -1;
        }
      }
    }
    return result;
  }
}
