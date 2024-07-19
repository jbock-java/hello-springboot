package com.bernd.game;

final class PointSet {

  private final int dim;
  private final int[] points;

  private PointSet(int dim, int[] points) {
    this.dim = dim;
    this.points = points;
  }

  static PointSet create(int dim) {
    return new PointSet(dim, new int[1 + ((dim * dim) / 16)]);
  }

  void add(int x, int y) {
    int ptId = y * dim + x;
    int base = ptId / 16;
    int off = ptId % 16;
    int shift = 1 << off;
    points[base] = points[base] | shift;
  }

  boolean has(int x, int y) {
    int ptId = y * dim + x;
    int base = ptId / 16;
    int off = ptId % 16;
    int shift = 1 << off;
    return (points[base] & shift) != 0;
  }
}
