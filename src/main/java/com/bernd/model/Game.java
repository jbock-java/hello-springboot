package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.util.BoardFunction;
import com.bernd.util.BoardFunctionImpl;
import com.bernd.util.BoardUpdater;

public record Game(
    String id,
    User black,
    User white,
    String currentUser,
    String[][] position
) {

  public Game update(Move move) {
    int x = move.x();
    int y = move.y();
    String color = currentUser.equals(black().name()) ? "b" : "w";
    BoardFunction update = BoardFunctionImpl.update(x, y, color);
    String[][] rows = BoardUpdater.apply(position, update);
    String[][] newRows = Board.removeDeadStonesAround(rows, x, y);
    return new Game(
        this.id,
        this.black,
        this.white,
        currentUser.equals(black.name()) ? white().name() : black().name(),
        newRows);
  }
}
