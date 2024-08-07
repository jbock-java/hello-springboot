package com.bernd.game;

import com.bernd.model.GameMove;
import com.bernd.model.Move;

import java.util.ArrayList;
import java.util.List;

public final class MoveList {

  private final List<GameMove> moves;

  private MoveList(List<GameMove> moves) {
    this.moves = moves;
  }

  public static MoveList create(int size) {
    return new MoveList(new ArrayList<>(size));
  }

  public void addGameEndMarker() {
    moves.add(new GameMove(moves.size(), 0, true, -1, -1, false, false, true));
  }

  public void add(Move move) {
    moves.add(move.toGameMove());
  }

  public GameMove get(int i) {
    return moves.get(i);
  }

  public boolean isEmpty() {
    return moves.isEmpty();
  }

  public int size() {
    return moves.size();
  }

  public List<GameMove> asList() {
    return List.copyOf(moves);
  }

  @Override
  public String toString() {
    return moves.toString();
  }
}
