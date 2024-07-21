package com.bernd.game;

import org.junit.jupiter.api.Test;

import static com.bernd.game.Board.B;
import static com.bernd.game.Board.REMOVED;
import static com.bernd.game.Board.W;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class ToggleTest {

  private static final int w = W | REMOVED;

  @Test
  void testTogggleTwoStones() {
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
}
