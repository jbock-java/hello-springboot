package com.bernd.game;

import com.bernd.model.Move;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public final class MoveList {

  private final List<Move> moves;

  private MoveList(List<Move> moves) {
    this.moves = moves;
  }

  public static MoveList create(int size) {
    return new MoveList(new ArrayList<>(size));
  }

  public void addGameEndMarker() {
    moves.add(new Move(0, moves.size(), "end", -1, -1));
  }

  public void add(Move move) {
    moves.add(move.toGameMove());
  }

  public Move get(int i) {
    return moves.get(i);
  }

  public boolean isEmpty() {
    return moves.isEmpty();
  }

  public int size() {
    return moves.size();
  }

  public Stream<Move> asStream() {
    return moves.stream();
  }

  @Override
  public String toString() {
    return moves.toString();
  }
}
