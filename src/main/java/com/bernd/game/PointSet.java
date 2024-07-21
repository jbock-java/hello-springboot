package com.bernd.game;

import static com.bernd.util.Util.divUp;

final class PointSet {

  private final int dim;
  private final int[] points;

  private PointSet(int dim, int[] points) {
    this.dim = dim;
    this.points = points;
  }

  static PointSet create(int dim) {
    return new PointSet(dim, new int[divUp(dim * dim, 0x20)]);
  }

  void add(int x, int y) {
    int ptId = y * dim + x;
    int pos = ptId >> 5;
    int test = 1 << (ptId & 0x1f);
    points[pos] = points[pos] | test;
  }

  boolean has(int x, int y) {
    int ptId = y * dim + x;
    int pos = ptId >> 5;
    int test = 1 << (ptId & 0x1f);
    return (points[pos] & test) != 0;
  }

  // visible for testing
  int length() {
    return points.length;
  }
}
