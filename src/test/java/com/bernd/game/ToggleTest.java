package com.bernd.game;

import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED_B;
import static com.bernd.game.Board.REMOVED_W;
import static com.bernd.game.Board.TERRITORY_B;
import static com.bernd.game.Board.TERRITORY_W;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ToggleTest {


  @Test
  void testToggleTwoStones() {
    int w = REMOVED_W;
    int[][] position = new int[][]{
        new int[]{0, W, W, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Toggle.toggleStonesAt(position, 1, 0);
    assertArrayEquals(new int[][]{
        new int[]{0, w, w, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    }, result);
  }

  @Test
  void testToggleTwoStonesAgain() {
    int w = REMOVED_W;
    int[][] position = new int[][]{
        new int[]{0, w, w, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    };
    int[][] result = Toggle.toggleStonesAt(position, 1, 0);
    assertArrayEquals(new int[][]{
        new int[]{0, W, W, 0},
        new int[]{B, B, B, B},
        new int[]{W, W, W, W},
        new int[]{0, 0, 0, 0},
    }, result);
  }

  @Test
  void testCornerEyeToggle() {
    int b = REMOVED_B;
    int t = TERRITORY_B;
    int[][] position = new int[][]{
        new int[]{t, B, W, 0, 0},
        new int[]{B, B, W, 0, 0},
        new int[]{W, W, W, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] result = Toggle.toggleStonesAt(position, 0, 1);
    assertArrayEquals(new int[][]{
        new int[]{t, b, W, 0, 0},
        new int[]{b, b, W, 0, 0},
        new int[]{W, W, W, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, result);
  }

  @Test
  void testToggleWhiteL() {
    int r = REMOVED_W;
    int t = TERRITORY_B;
    int[][] position = new int[][]{
        new int[]{t, B, W, 0, 0},
        new int[]{B, B, W, 0, 0},
        new int[]{W, W, W, 0, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] result = Toggle.toggleStonesAt(position, 0, 2);
    assertArrayEquals(new int[][]{
        new int[]{t, B, r, 0, 0},
        new int[]{B, B, r, 0, 0},
        new int[]{r, r, r, 0, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, result);
  }

  @Test
  void testResetCounting() {
    int f = REMOVED_W | TERRITORY_B;
    int t = TERRITORY_B;
    int[][] position = new int[][]{
        new int[]{t, B, f, t, t},
        new int[]{B, B, f, t, t},
        new int[]{f, f, f, t, t},
        new int[]{t, t, t, t, t},
        new int[]{t, t, t, t, t},
    };
    int[][] result = Toggle.resetCounting(position);
    assertArrayEquals(new int[][]{
        new int[]{0, B, W, 0, 0},
        new int[]{B, B, W, 0, 0},
        new int[]{W, W, W, 0, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, result);
  }

  @Test
  void testToggleTwice() {
    int t = TERRITORY_W;
    int r = TERRITORY_W | REMOVED_B;
    int k = REMOVED_W;
    int[][] position = new int[][]{
        new int[]{t, r, W, 0, 0},
        new int[]{r, r, W, 0, 0},
        new int[]{W, W, W, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    };
    int[][] toggled = Toggle.toggleStonesAt(position, 0, 2);
    assertArrayEquals(new int[][]{
        new int[]{t, r, k, 0, 0},
        new int[]{r, r, k, 0, 0},
        new int[]{k, k, k, B, 0},
        new int[]{0, 0, 0, 0, 0},
        new int[]{0, 0, 0, 0, 0},
    }, toggled);
  }
}
