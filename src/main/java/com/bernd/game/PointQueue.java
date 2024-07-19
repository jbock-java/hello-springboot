package com.bernd.game;

final class PointQueue {
  private int pos;
  private final int dim;
  private final int[] queue;

  private PointQueue(int dim, int[] queue) {
    this.dim = dim;
    this.queue = queue;
  }

  static PointQueue create(int dim) {
    return new PointQueue(dim, new int[4 * dim]);
  }

  void offer(int x, int y) {
    queue[pos] = dim * y + x;
    pos++;
  }

  int poll() {
    int result = queue[pos - 1];
    pos--;
    return result;
  }

  boolean isEmpty() {
    return pos == 0;
  }
}
