package com.bernd.model;

public record AcceptRequest(
    String opponent,
    OpenGame game,
    boolean flip,
    int handicap) {

  public AcceptRequest withOpponent(String opponent) {
    return new AcceptRequest(opponent, game, flip, handicap);
  }
}
