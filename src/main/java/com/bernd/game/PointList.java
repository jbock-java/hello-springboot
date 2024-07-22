package com.bernd.game;

import java.util.Arrays;

import static com.bernd.util.Util.divUp;

public final class PointList {

  private static final int LO = 0xffff;
  private static final int HI = 0xffff0000;

  private int pos;
  private int capacity;
  private final int dim;
  private int[] buffer;

  private PointList(
      int dim,
      int[] buffer) {
    this.capacity = 2 * buffer.length;
    this.dim = dim;
    this.buffer = buffer;
  }

  public static PointList create(int dim, int size) {
    return new PointList(dim, new int[divUp(size, 2)]);
  }

  public static PointList create(int dim) {
    return new PointList(dim, new int[16]);
  }

  public void add(int x, int y) {
    if (pos >= capacity) {
      buffer = Arrays.copyOf(buffer, divUp(dim * dim, 2));
      capacity = dim * dim;
    }
    int ptId = dim * y + x;
    set(ptId);
    pos++;
  }

  private int get(int i) {
    int code = buffer[i / 2];
    return i % 2 == 0 ? code & LO : (code >> 16);
  }

  private void set(int ptId) {
    int i = pos / 2;
    if (pos % 2 == 0) {
      buffer[i] = (buffer[i] & HI) | ptId;
    } else {
      buffer[i] = (ptId << 16) | (buffer[i] & LO);
    }
  }

  public int x(int i) {
    int ptId = get(i);
    return ptId % dim;
  }

  public int y(int i) {
    int ptId = get(i);
    return ptId / dim;
  }

  public int size() {
    return pos;
  }

  public void forEach(PointConsumer consumer) {
    for (int i = 0; i < pos; i++) {
      consumer.accept(x(i), y(i));
    }
  }

  @Override
  public String toString() {
    if (pos == 0) {
      return "[]";
    }
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < pos; i++) {
      sb.append("(")
          .append(x(i)).append(" ").append(y(i))
          .append("), ");
    }
    sb.setLength(sb.length() - 2);
    sb.append("]");
    return sb.toString();
  }
}
