package com.bernd.util;

import com.bernd.game.Board;
import com.bernd.game.MoveList;
import com.bernd.model.Game;
import com.bernd.model.Move;
import java.time.LocalDate;
import java.time.Month;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SgfCreatorTest {

  @Test
  void testCreate() {
    MoveList moveList = MoveList.create(20);
    moveList.add(new Move(Board.B, 0, null, 3, 4));
    moveList.add(new Move(Board.W, 0, null, 6, 4));
    Game game = new Game(
      "1234",
      "B",
      "W",
      1,
      new int[9][],
      9,
      10,
      1727532679000L,
      0,
      new int[]{-1, -1},
      moveList);
    String sgf = SgfCreator.createSgf(game, LocalDate.of(2024, Month.AUGUST, 30));
    assertEquals("(;FF[4]CA[UTF-8]GM[1]DT[2024-08-30]GN[1234]PB[B]PW[W]RE[?]SZ[9];B[de];W[ge])",
        sgf.replace("\n", ""));
  }

}
