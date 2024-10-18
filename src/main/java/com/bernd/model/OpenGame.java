package com.bernd.model;

import com.bernd.game.MoveList;
import java.util.ArrayList;
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

  public OpenGame addRequest(AcceptRequest request, String opponent) {
    List<AcceptRequest> updated = new ArrayList<>(requests().size() + 1);
    updated.addAll(requests());
    updated.add(request.withOpponent(opponent));
    return new OpenGame(id, user, updated, dim, timesetting);
  }

  private List<AcceptRequest> getRequests() {
    if (requests == null) {
      return List.of();
    }
    return requests;
  }

  private OpenGame sanitize() {
    if (requests != null) {
      return this;
    }
    return new OpenGame(id, user, List.of(), dim, timesetting);
  }

  public Game accept(AcceptRequest acceptRequest) {
    String userBlack = acceptRequest.flip() ? acceptRequest.opponent() : user;
    String userWhite = acceptRequest.flip() ? user : acceptRequest.opponent();
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
