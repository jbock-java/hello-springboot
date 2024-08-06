package com.bernd.model;

import com.bernd.game.MoveList;
import org.junit.jupiter.api.Test;

import static com.bernd.LobbyController.createEmptyBoard;
import static com.bernd.game.Board.B;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GameBuilderTest {

  @Test
  void unchanged() {
    Game game = new Game(
        "123",
        new User("bernd"),
        new User("heike"),
        true,
        B,
        true,
        createEmptyBoard(9),
        9,
        2,
        new int[]{-1, -1},
        MoveList.create(2));
    Game game2 = GameBuilder.builder(game).build();
    assertEquals(game, game2);
  }
}