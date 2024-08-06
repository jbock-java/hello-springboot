package com.bernd.model;

public final class GameBuilder {
  private final Game game;

  private boolean counting;
  private int countingAgreed;
  private boolean opponentPassed;
  private int[][] board;
  private int[] forbidden;

  private GameBuilder(Game game) {
    this.game = game;
  }

  public GameBuilder withCounting(boolean counting) {
    this.counting = counting;
    return this;
  }

  public GameBuilder withCountingAgreed(int countingAgreed) {
    this.countingAgreed = countingAgreed;
    return this;
  }

  public GameBuilder withOpponentPassed(boolean opponentPassed) {
    this.opponentPassed = opponentPassed;
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
    builder.counting = game.counting();
    builder.countingAgreed = game.countingAgreed();
    builder.opponentPassed = game.opponentPassed();
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
        opponentPassed,
        board,
        game.dim(),
        game.handicap(),
        forbidden,
        game.moves()
    );
  }
}
