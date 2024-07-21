package com.bernd.game;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PointSetTest {

  @Test
  void testSmall() {
    PointSet pointSet = PointSet.create(2);
    pointSet.add(0, 1);
    pointSet.add(1, 1);
    assertFalse(pointSet.has(0, 0));
    assertTrue(pointSet.has(0, 1));
    assertFalse(pointSet.has(1, 0));
    assertTrue(pointSet.has(1, 1));
  }

  @Test
  void testBig() {
    PointSet pointSet = PointSet.create(19);
    pointSet.add(10, 10);
    assertFalse(pointSet.has(9, 10));
    assertFalse(pointSet.has(10, 9));
    assertTrue(pointSet.has(10, 10));
    assertFalse(pointSet.has(10, 11));
    assertFalse(pointSet.has(11, 10));
  }

  @Test
  void testFullCapacity() {
    int dim = 64;
    PointSet pointSet = PointSet.create(dim);
    for (int x = 0; x < dim; x++) {
      for (int y = 0; y < dim; y++) {
        assertFalse(pointSet.has(x, y));
        pointSet.add(x, y);
        assertTrue(pointSet.has(x, y));
      }
    }
  }
}
