package com.bernd.model;

public final class GameBuilder {
  private final Game game;

  private boolean counting;
  private int countingAgreed;
  private int remainingHandicap;
  private int[][] board;
  private int[] forbidden;

  private GameBuilder(Game game) {
    this.game = game;
  }

  public GameBuilder withRemainingHandicap(int remainingHandicap) {
    this.remainingHandicap = remainingHandicap;
    return this;
  }

  public GameBuilder withCounting(boolean counting) {
    this.counting = counting;
    return this;
  }

  public GameBuilder withCountingAgreed(int countingAgreed) {
    this.countingAgreed = countingAgreed;
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
    builder.remainingHandicap = game.remainingHandicap();
    builder.counting = game.counting();
    builder.countingAgreed = game.countingAgreed();
    builder.board = game.board();
    builder.forbidden = game.forbidden();
    return builder;
  }

  public Game build() {
    return new Game(
        game.id(),
        game.black(),
        game.white(),
        counting,
        countingAgreed,
        board,
        game.dim(),
        game.handicap(),
        remainingHandicap,
        forbidden,
        game.moves()
    );
  }
}
