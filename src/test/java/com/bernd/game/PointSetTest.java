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
}
