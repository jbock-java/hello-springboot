package com.bernd.game;

import com.bernd.util.Util;
import org.junit.jupiter.api.Test;

import static com.bernd.game.CountTest.createEmptyBoard;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PointQueueTest {

  @Test
  void testOfferAndPoll() {
    int dim = 4;
    PointQueue queue = PointQueue.create(dim);
    queue.offer(0, 1);
    queue.offer(1, 2);
    poll(queue, 0, 1);
    queue.offer(2, 3);
    poll(queue, 1, 2);
    poll(queue, 2, 3);
    assertTrue(queue.isEmpty());
  }

  @Test
  void testFullCapacity() {
    PointQueue queue = PointQueue.byCapacity(2, 4);
    queue.offer(0, 0);
    queue.offer(0, 1);
    queue.offer(1, 0);
    queue.offer(1, 1);
    poll(queue, 0, 0);
    poll(queue, 0, 1);
    poll(queue, 1, 0);
    poll(queue, 1, 1);
    assertTrue(queue.isEmpty());
  }

  @Test
  void testCapacityExceeded() {
    PointQueue queue = PointQueue.byCapacity(2, 3);
    queue.offer(0, 0);
    queue.offer(0, 1);
    queue.offer(1, 0);
    assertThrows(RuntimeException.class, () -> queue.offer(1, 1));
  }

  @Test
  void testDiamond() {
    int dim = 5;
    int[][] board = createEmptyBoard(dim);
    PointQueue pointsToCheck = PointQueue.create(dim);
    pointsToCheck.offer(2, 2);
    for (int i = 0; i < 9; i++) {
      int ptId = pointsToCheck.poll();
      int y = ptId / dim;
      int x = ptId % dim;
      board[y][x] = 2;
      if (y > 0 && board[y - 1][x] == 0) {
        board[y - 1][x] = 1;
        pointsToCheck.offer(x, y - 1);
      }
      if (y < dim - 1 && board[y + 1][x] == 0) {
        board[y + 1][x] = 1;
        pointsToCheck.offer(x, y + 1);
      }
      if (x > 0 && board[y][x - 1] == 0) {
        board[y][x - 1] = 1;
        pointsToCheck.offer(x - 1, y);
      }
      if (x < dim - 1 && board[y][x + 1] == 0) {
        board[y][x + 1] = 1;
        pointsToCheck.offer(x + 1, y);
      }
    }
    // After 9 iterations, the diamond contains exactly two points per row.
    assertArrayEquals(new int[][]{
        new int[]{0, 1, 2, 1, 0},
        new int[]{1, 2, 2, 2, 1},
        new int[]{1, 2, 2, 2, 1},
        new int[]{0, 1, 2, 1, 0},
        new int[]{0, 1, 2, 1, 0},
    }, board, () -> Util.boardToString(board));
  }

  private void poll(PointQueue queue, int expect_x, int expect_y) {
    assertFalse(queue.isEmpty());
    int ptId = queue.poll();
    int x = ptId % queue.dim();
    int y = ptId / queue.dim();
    assertEquals(expect_x, x);
    assertEquals(expect_y, y);
  }
}
