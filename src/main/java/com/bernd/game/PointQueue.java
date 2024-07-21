package com.bernd.game;

import static com.bernd.util.Util.divideUp;

final class PointQueue {

  private static final int LO = 0xffff;
  private static final int HI = 0xffff0000;

  private final int capacity;
  private final int dim;

  private int write;
  private int read;
  private final int[] buffer;

  private PointQueue(
      int capacity,
      int dim,
      int[] buffer) {
    this.capacity = capacity;
    this.dim = dim;
    this.buffer = buffer;
  }

  static PointQueue create(int dim) {
    // Assumption 1: All algorithms proceed from the starting point outward in a diamond shape.
    // Assumption 2: The circumference of the diamond shape is not greater than 2 * dim + 1.
    int capacity = 2 * dim + 1;
    return new PointQueue(capacity, dim, new int[divideUp(capacity, 2)]);
  }

  void offer(int x, int y) {
    int ptId = dim * y + x;
    set(ptId);
    write = (write + 1) % capacity;
    if (write == read) {
      throw new RuntimeException("buffer overflow");
    }
  }

  int poll() {
    int ptId = get();
    read = (read + 1) % capacity;
    return ptId;
  }

  private int get() {
    int code = buffer[read / 2];
    return read % 2 == 0 ? code & LO : (code >> 16);
  }

  private void set(int ptId) {
    int pos = write / 2;
    if (write % 2 == 0) {
      buffer[pos] = (buffer[pos] & HI) | ptId;
    } else {
      buffer[pos] = (ptId << 16) | (buffer[pos] & LO);
    }
  }

  boolean isEmpty() {
    return write == read;
  }
}
