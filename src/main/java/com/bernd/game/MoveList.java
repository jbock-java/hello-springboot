package com.bernd.game;

import com.bernd.model.GameMove;
import com.bernd.model.Move;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.bernd.util.Util.divUp;

public final class MoveList {

  private static final int LO = 0xffff;
  private static final int HI = 0xffff0000;
  private static final int WHITE = 0x1000;
  private static final int PASS = 0x2000;
  private static final int DATA = 0x0fff;

  public static void main(String[] args) {
    int n = 1024 * 4;
    System.out.printf("%x\n", n);
    System.out.println(n);
    System.out.printf("%x\n", 2 * n);
    System.out.println(2 * n);
  }

  private int pos;
  private int capacity;
  private final int dim;
  private int[] buffer;

  private MoveList(
      int dim,
      int[] buffer) {
    this.capacity = dim * dim;
    this.dim = dim;
    this.buffer = buffer;
  }

  public static MoveList create(int dim, int size) {
    return new MoveList(dim, new int[divUp(size, 2)]);
  }

  public static MoveList create(int dim) {
    return new MoveList(dim, new int[16]);
  }

  public void add(int color, Move move) {
    if (pos >= capacity) {
      int newCapacity = 2 * capacity;
      buffer = Arrays.copyOf(buffer, divUp(newCapacity, 2));
      capacity = newCapacity;
    }
    int ptId;
    if (move.pass()) {
      ptId = PASS;
    } else {
      ptId = dim * move.y() + move.x();
    }
    if (color == Board.W) {
      ptId |= WHITE;
    }
    set(ptId);
    pos++;
  }

  public GameMove get(int i) {
    int code = buffer[i / 2];
    int ptId = i % 2 == 0 ? code & LO : (code >> 16);
    int color = (ptId & WHITE) != 0 ? Board.W : Board.B;
    if ((ptId & PASS) != 0) {
      return new GameMove(i, color, true, -1, -1);
    } else {
      int data = ptId & DATA;
      int x = data % dim;
      int y = data / dim;
      return new GameMove(i, color, true, x, y);
    }
  }

  private void set(int ptId) {
    int i = pos / 2;
    if (pos % 2 == 0) {
      buffer[i] = (buffer[i] & HI) | ptId;
    } else {
      buffer[i] = (ptId << 16) | (buffer[i] & LO);
    }
  }

  public int size() {
    return pos;
  }

  public List<GameMove> asList() {
    List<GameMove> result = new ArrayList<>(size());
    for (int i = 0; i < pos; i++) {
      result.add(get(i));
    }
    return result;
  }

  public int dim() {
    return dim;
  }

  @Override
  public String toString() {
    if (pos == 0) {
      return "[]";
    }
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < pos; i++) {
      sb.append("(")
          .append(get(i))
          .append("), ");
    }
    sb.setLength(sb.length() - 2);
    sb.append("]");
    return sb.toString();
  }
}