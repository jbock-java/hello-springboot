package com.bernd.model;

import com.bernd.game.MoveList;

import static com.bernd.LobbyController.createEmptyBoard;

public record OpenGame(
    String id,
    String user,
    int dim,
    int handicap) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, dim, handicap);
  }

  public OpenGame withUser(String name) {
    return new OpenGame(id, name, dim, handicap);
  }

  public Game accept(String opponent, AcceptRequest acceptRequest) {
    String userBlack = acceptRequest.flip() ? opponent : user;
    String userWhite = acceptRequest.flip() ? user : opponent;
    return new Game(
        id,
        userBlack,
        userWhite,
        false,
        0,
        createEmptyBoard(dim),
        dim,
        acceptRequest.handicap(),
        new int[]{-1, -1},
        MoveList.create(dim));
  }
}
