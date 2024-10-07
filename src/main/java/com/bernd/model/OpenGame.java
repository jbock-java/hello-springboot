package com.bernd.model;

import com.bernd.game.MoveList;
import java.util.List;

import static com.bernd.LobbyController.createEmptyBoard;

public record OpenGame(
    String id,
    String user,
    List<AcceptRequest> requests,
    int dim,
    int timesetting) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, requests, dim, timesetting).sanitize();
  }

  public OpenGame withUser(String user) {
    return new OpenGame(id, user, requests, dim, timesetting).sanitize();
  }

  private OpenGame sanitize() {
    if (requests == null) {
      return new OpenGame(id, user, List.of(), dim, timesetting);
    }
    return this;
  }

  public Game accept(String opponent, AcceptRequest acceptRequest) {
    String userBlack = acceptRequest.flip() ? opponent : user;
    String userWhite = acceptRequest.flip() ? user : opponent;
    return new Game(
        id,
        userBlack,
        userWhite,
        Game.STATE_NORMAL,
        createEmptyBoard(dim),
        dim,
        timesetting,
        System.currentTimeMillis(),
        acceptRequest.handicap(),
        new int[]{-1, -1},
        MoveList.create(dim));
  }
}
