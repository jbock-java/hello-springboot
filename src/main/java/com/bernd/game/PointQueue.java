package com.bernd.game;

final class PointQueue {

  private int write;
  private int read;
  private final int dim;
  private final int[] buffer;

  private PointQueue(int dim, int[] buffer) {
    this.dim = dim;
    this.buffer = buffer;
  }

  static PointQueue create(int dim) {
    return new PointQueue(dim, new int[4 * dim]);
  }

  void offer(int x, int y) {
    buffer[write] = dim * y + x;
    write = (write + 1) % buffer.length;
  }

  int poll() {
    int result = buffer[read];
    read = (read + 1) % buffer.length;
    return result;
  }

  boolean isEmpty() {
    return write == read;
  }
}
