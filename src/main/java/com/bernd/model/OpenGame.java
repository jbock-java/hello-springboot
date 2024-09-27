package com.bernd.model;

import com.bernd.game.MoveList;

import static com.bernd.LobbyController.createEmptyBoard;

public record OpenGame(
    String id,
    String user,
    int dim,
    int timesetting,
    int handicap) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, dim, timesetting, handicap);
  }

  public OpenGame withUser(String name) {
    return new OpenGame(id, name, dim, timesetting, handicap);
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
