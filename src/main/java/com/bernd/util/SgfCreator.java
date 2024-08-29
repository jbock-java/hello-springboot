package com.bernd.util;

import com.bernd.model.Game;
import com.bernd.model.Move;
import java.time.LocalDate;

public final class SgfCreator {

  public static String createSgf(Game game, LocalDate date) {
    int twoPass = 0;
    int asciiAddOn = 97;
    StringBuilder sb = new StringBuilder();
    sb.append("(;");
    sb
        .append("FF[4]\n")
        .append("CA[UTF-8]\n")
        .append("GM[1]\n")
        .append("DT[" + date.toString() + "]\n")
        .append("GN[" + game.id() + "]\n")
        .append("PB[" + game.black() + "]\n")
        .append("PW[" + game.white() + "]\n")
        .append("RE[" + (game.gameHasEnded() ? game.getScore() : "?") + "]\n")
        .append("SZ[" + game.dim() + "]\n");
    for (Move move : game.moves().moves()) {
      sb
          .append(";")
          .append(getColorFromValue(move.color()))
          .append("[");
      if (!move.pass()) {
        twoPass = 0;
        sb
            .append((char) (move.x() + asciiAddOn))
            .append((char) (move.y() + asciiAddOn));
      } else {
        twoPass++;
        if (twoPass == 2) {
          sb.append("]\n");
          break;
        }
      }
      sb
          .append("]\n");
    }
    sb.append(")");
    return sb.toString();
  }

  private static String getColorFromValue(int value) {
    if (value == 32) {
      return "B";
    }
    return "W";
  }

}
