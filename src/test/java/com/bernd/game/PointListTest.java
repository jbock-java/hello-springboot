package com.bernd.game;

import java.util.LinkedHashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PointListTest {

  @Test
  void testGrow() {
    int dim = 9;
    PointList list = PointList.create(dim);
    for (int y = 0; y < dim; y++) {
      for (int x = 0; x < dim; x++) {
        list.add(x, y);
      }
    }
    Set<Point> test = new LinkedHashSet<>(2 * dim * dim);
    list.forEach((x, y) -> test.add(new Point(x, y)));
    assertEquals(81, test.size());
  }

  @Test
  void testToString() {
    int dim = 9;
    PointList list = PointList.create(dim);
    list.add(0, 1);
    list.add(2, 3);
    assertEquals("[(0 1), (2 3)]", list.toString());
  }

  private record Point(int x, int y) {
  }
}
