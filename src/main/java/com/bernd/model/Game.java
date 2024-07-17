package com.bernd.model;

import com.bernd.game.Board;

import java.util.ArrayList;
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
    List<List<String>> rows = new ArrayList<>(position.size());
    for (int i = 0; i < y; i++) {
      rows.add(position.get(i));
    }
    List<String> row = new ArrayList<>(position.size());
    for (int i = 0; i < x; i++) {
      row.add(position.get(y).get(i));
    }
    row.add(color);
    for (int i = x + 1; i < position().size(); i++) {
      row.add(position.get(y).get(i));
    }
    rows.add(row);
    for (int i = y + 1; i < position().size(); i++) {
      rows.add(position.get(i));
    }
    List<List<String>> newRows = Board.removeDeadStonesAround(rows, x, y);
    return new Game(
        this.id,
        this.black,
        this.white,
        currentUser.equals(black.name()) ? white().name() : black().name(),
        newRows);
  }
}
