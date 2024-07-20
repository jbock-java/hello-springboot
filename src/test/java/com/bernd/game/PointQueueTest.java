package com.bernd.game;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PointQueueTest {

  @Test
  void testOffer() {
    int dim = 4;
    PointQueue queue = PointQueue.create(dim);
    assertTrue(queue.isEmpty());
    queue.offer(0, 1);
    queue.offer(1, 2);
    int pid = queue.poll();
    assertFalse(queue.isEmpty());
    int x = pid % dim;
    int y = pid / dim;
    assertEquals(0, x);
    assertEquals(1, y);
    queue.offer(2, 3);
    pid = queue.poll();
    assertFalse(queue.isEmpty());
    x = pid % dim;
    y = pid / dim;
    assertEquals(1, x);
    assertEquals(2, y);
    pid = queue.poll();
    x = pid % dim;
    y = pid / dim;
    assertEquals(2, x);
    assertEquals(3, y);
    assertTrue(queue.isEmpty());
  }
}
