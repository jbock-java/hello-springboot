package com.bernd.game;

import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED;
import static com.bernd.game.Board.TERRITORY;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ToggleTest {

  private static final int w = W | REMOVED;
  private static final int b = B | REMOVED;

  @Test
  void testToggleTwoStones() {
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
    int b = B | REMOVED;
    int t = B | TERRITORY;
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
}
