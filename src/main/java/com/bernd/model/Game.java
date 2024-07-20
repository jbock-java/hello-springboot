package com.bernd.model;

import com.bernd.game.Board;
import com.bernd.game.Count;
import com.bernd.util.BoardUpdate;
import java.util.Arrays;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public record Game(
    String id,
    User black,
    User white,
    boolean counting,
    String currentPlayer,
    boolean opponentPassed,
    int[][] board
) {

  private static final Logger logger = LogManager.getLogger(Game.class);

  public Game update(Move move) {
    try {
      return updateInternal(move);
    } catch (RuntimeException e) {
      StringBuilder sb = new StringBuilder("int[][] position = new int[][]{\n");
      for (int[] row : board) {
        String string = Arrays.toString(row).replace('[', '{').replace(']', '}');
        sb.append("  new int[]" + string + ",\n");
      }
      sb.append("};\n");
      logger.error(sb.toString(), e);
      return this;
    }
  }

  private Game updateInternal(Move move) {
    if (move.pass()) {
      if (!opponentPassed) {
        return game(board, counting, true);
      }
      int[][] counted = Count.count(board);
      return game(counted, true);
    }
    int x = move.x();
    int y = move.y();
    int color = currentColor();
    int[][] updated = BoardUpdate.create(board.length, x, y, color).apply(board);
    return game(Board.removeDeadStonesAround(updated, x, y));
  }

  private Game game(
      int[][] board,
      boolean counting,
      boolean opponentPassed) {
    return new Game(
        id,
        black,
        white,
        counting,
        nextPlayer(),
        opponentPassed,
        board);
  }

  private Game game(
      int[][] board) {
    return game(board, counting, opponentPassed);
  }

  private Game game(
      int[][] board,
      boolean counting) {
    return game(board, counting, opponentPassed);
  }

  private String nextPlayer() {
    return currentPlayer.equals(black.name()) ? white().name() : black().name();
  }

  private int currentColor() {
    return currentPlayer.equals(black().name()) ? Board.B : Board.W;
  }
}
