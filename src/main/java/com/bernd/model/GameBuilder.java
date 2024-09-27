package com.bernd.model;

public final class GameBuilder {
  private final Game game;

  private int state;
  private int[][] board;
  private int[] forbidden;

  private GameBuilder(Game game) {
    this.game = game;
  }

  public GameBuilder withState(int state) {
    this.state = state;
    return this;
  }

  public GameBuilder withBoard(int[][] board) {
    this.board = board;
    return this;
  }

  public GameBuilder withForbidden(int[] forbidden) {
    this.forbidden = forbidden;
    return this;
  }

  public GameBuilder withForbidden(int x, int y) {
    return withForbidden(new int[]{x, y});
  }

  static GameBuilder builder(Game game) {
    GameBuilder builder = new GameBuilder(game);
    builder.state = game.state();
    builder.board = game.board();
    builder.forbidden = game.forbidden();
    return builder;
  }

  public Game build() {
    return new Game(
        game.id(),
        game.black(),
        game.white(),
        state,
        board,
        game.dim(),
        game.timesetting(),
        System.currentTimeMillis(),
        game.handicap(),
        forbidden,
        game.moves()
    );
  }
}
