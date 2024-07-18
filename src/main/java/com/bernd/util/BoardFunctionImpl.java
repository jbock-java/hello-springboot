package com.bernd.util;

import com.bernd.game.Point;

public class BoardFunctionImpl implements BoardFunction {
  private final int size;
  private final String[] store;

  private BoardFunctionImpl(
      int size,
      String[] store) {
    this.size = size;
    this.store = store;
  }

  public static BoardFunctionImpl create(int size) {
    return new BoardFunctionImpl(size, new String[size * size]);
  }

  public static BoardFunction update(int x, int y, String value) {
    return (_x, _y) -> {
      if (_x == x && _y == y) {
        return value;
      }
      return null;
    };
  }

  public void put(int x, int y, String value) {
    store[y * size + x] = value;
  }

  public void put(Point point, String value) {
    put(point.x(), point.y(), value);
  }

  @Override
  public String apply(int x, int y) {
    return store[y * size + x];
  }
}
