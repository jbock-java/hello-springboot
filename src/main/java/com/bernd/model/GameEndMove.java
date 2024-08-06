package com.bernd.model;

public record GameEndMove(boolean gameHasEnded) {

  public static GameEndMove create() {
    return new GameEndMove(true);
  }
}
