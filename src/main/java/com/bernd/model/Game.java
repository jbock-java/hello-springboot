package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.util.BoardFunction;
import com.bernd.util.BoardFunctionImpl;
import com.bernd.util.BoardUpdater;
import java.util.List;

public record Game(
    String id,
    User black,
    User white,
    String currentUser,
    List<List<String>> position
) {

  public Game update(Move move) {
    int x = move.x();
    int y = move.y();
    String color = currentUser.equals(black().name()) ? "b" : "w";
    BoardFunction update = BoardFunctionImpl.update(x, y, color);
    List<List<String>> rows = BoardUpdater.apply(position, update);
    List<List<String>> newRows = Board.removeDeadStonesAround(rows, x, y);
    return new Game(
        this.id,
        this.black,
        this.white,
        currentUser.equals(black.name()) ? white().name() : black().name(),
        newRows);
  }
}
