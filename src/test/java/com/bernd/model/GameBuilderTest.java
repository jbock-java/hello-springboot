package com.bernd.model;

import com.bernd.game.MoveList;
import org.junit.jupiter.api.Test;

import static com.bernd.LobbyController.createEmptyBoard;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GameBuilderTest {

  @Test
  void unchanged() {
    Game game = new Game(
        "123",
        "bernd",
        "heike",
        1,
        createEmptyBoard(9),
        9,
        10,
        1727532679000L,
        0,
        new int[]{-1, -1},
        MoveList.create(2));
    Game game2 = GameBuilder.builder(game).withUpdated(game.updated()).build();
    assertEquals(game, game2);
  }
}
