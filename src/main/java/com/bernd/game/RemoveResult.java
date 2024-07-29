package com.bernd.game;

import com.bernd.util.BoardUpdateImpl;

import static com.bernd.util.Util.COLORS;

public record RemoveResult(
    int[][] board,
    Direction direction
) {
  public boolean isKo(int xx, int yy, int color) {
    if (direction == Direction.NONE) {
      return false;
    }
    int x = direction.moveX(xx);
    int y = direction.moveY(yy);
    int oppositeColor = color ^ COLORS;
    int[][] updated = BoardUpdateImpl.create(board.length, x, y, oppositeColor).apply(board);
    RemoveResult result = Board.removeDeadStonesAround(updated, x, y);
    return result.direction.isOpposite(direction);
  }
}
