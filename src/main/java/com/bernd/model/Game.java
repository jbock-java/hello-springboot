package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.util.BoardUpdate;
import java.util.function.Function;

public record Game(
    String id,
    User black,
    User white,
    String currentUser,
    int[][] board
) {

  public Game update(Move move) {
    int x = move.x();
    int y = move.y();
    int color = currentUser.equals(black().name()) ? Board.BLACK : Board.WHITE;
    Function<int[][], int[][]> update = BoardUpdate.create(board.length, x, y, color);
    int[][] rows = update.apply(board);
    int[][] newRows = Board.removeDeadStonesAround(rows, x, y);
    return new Game(
        this.id,
        this.black,
        this.white,
        currentUser.equals(black.name()) ? white().name() : black().name(),
        newRows);
  }
}
