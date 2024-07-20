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
    // Assumption: All algorithms proceed from the starting point outward in a diamond shape.
    // The circumference of the diamond shape is not greater than 2 * dim.
    return new PointQueue(dim, new int[2 * dim + 1]);
  }

  void offer(int x, int y) {
    buffer[write] = dim * y + x;
    write = (write + 1) % buffer.length;
    if (write == read) {
      throw new RuntimeException("buffer overflow");
    }
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
