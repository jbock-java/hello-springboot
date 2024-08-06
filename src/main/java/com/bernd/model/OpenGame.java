package com.bernd.model;

import com.bernd.game.MoveList;

import static com.bernd.LobbyController.createEmptyBoard;

public record OpenGame(
    String id,
    User user,
    int dim,
    int handicap) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, dim, handicap);
  }

  public OpenGame withUser(String name) {
    return new OpenGame(id, new User(name), dim, handicap);
  }

  public Game accept(String opponent, AcceptRequest acceptRequest) {
    User userBlack = acceptRequest.flip() ? new User(opponent) : user;
    User userWhite = acceptRequest.flip() ? user : new User(opponent);
    return new Game(
        id,
        userBlack,
        userWhite,
        false,
        0,
        false,
        createEmptyBoard(dim),
        dim,
        acceptRequest.handicap(),
        new int[]{-1, -1},
        MoveList.create(dim));
  }
}
