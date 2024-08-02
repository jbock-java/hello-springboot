package com.bernd.model;

import com.bernd.game.MoveList;

import static com.bernd.LobbyController.createEmptyBoard;
import static com.bernd.game.Board.B;

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
        false,
        userBlack.name(),
        B,
        false,
        createEmptyBoard(dim),
        acceptRequest.handicap(),
        new int[]{-1, -1},
        MoveList.create(dim));
  }
}
