package com.bernd.game;

import com.bernd.util.Util;
import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED_B;
import static com.bernd.game.Board.REMOVED_W;
import static com.bernd.game.Board.TERRITORY_B;
import static com.bernd.game.Board.TERRITORY_W;
import static com.bernd.game.Board.W;
import static com.bernd.game.Count.colorEmptyTerritory;
import static com.bernd.game.Count.getImpliedColor;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CountTest {

  private static final int b = TERRITORY_B;
  private static final int p = TERRITORY_B | REMOVED_W;
  private static final int w = TERRITORY_W;
  private static final int v = REMOVED_W;

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
    int b = REMOVED_B;
    int w = TERRITORY_W;
    int k = TERRITORY_W | REMOVED_B;
    int t = TERRITORY_B;
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
    int b = REMOVED_B;
    int t = TERRITORY_B;
    int[][] board = {
        new int[]{t, b, W},
        new int[]{b, b, W},
        new int[]{W, W, W},
    };
    assertEquals(TERRITORY_W, getImpliedColor(board, 0, 0));
    assertEquals(TERRITORY_W, getImpliedColor(board, 0, 1));
    assertEquals(TERRITORY_W, getImpliedColor(board, 1, 0));
    assertEquals(TERRITORY_W, getImpliedColor(board, 1, 1));
  }

  @Test
  void testCountWhiteL() {
    int r = REMOVED_W;
    int f = TERRITORY_B | REMOVED_W;
    int t = TERRITORY_B;
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

  @Test
  void testCountAgain() {
    int t = TERRITORY_W;
    int r = TERRITORY_W | REMOVED_B;
    int v = TERRITORY_B;
    int k = REMOVED_W;
    int s = REMOVED_W | TERRITORY_B;
    int[][] position = new int[][]{
        new int[]{t, r, k, 0, 0},
        new int[]{r, r, k, 0, 0},
        new int[]{k, k, k, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] counted = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{v, B, s, v, v},
        new int[]{B, B, s, v, v},
        new int[]{s, s, s, B, v},
        new int[]{v, v, v, v, v},
        new int[]{v, v, v, v, v},
    }, counted);
  }

  @Test
  void testTerritoryBorderRemoved() {
    int b = TERRITORY_B;
    int k = REMOVED_B;
    int[][] position = new int[][]{
        new int[]{W, B, b, b, b},
        new int[]{W, B, b, b, b},
        new int[]{W, B, b, b, b},
        new int[]{B, B, b, k, k},
        new int[]{B, b, B, W, W},
    };
    int[][] counted = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{W, B, 0, 0, 0},
        new int[]{W, B, 0, 0, 0},
        new int[]{W, B, 0, 0, 0},
        new int[]{B, B, 0, k, k},
        new int[]{B, b, B, W, W},
    }, counted);
  }

  @Test
  void testResurrect() {
    int b = TERRITORY_B;
    int w = TERRITORY_B | REMOVED_W;
    int k = REMOVED_B;
    int[][] position = new int[][]{
        new int[]{B, b, B, w},
        new int[]{b, k, w, w},
        new int[]{w, k, w, b},
        new int[]{B, w, w, b}
    };
    int[][] counted = Count.count(position);
    assertArrayEquals(new int[][]{
        new int[]{B, b, B, w},
        new int[]{b, B, w, w},
        new int[]{w, B, w, b},
        new int[]{B, w, w, b}
    }, counted);
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
