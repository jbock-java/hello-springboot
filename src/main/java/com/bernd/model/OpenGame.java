package com.bernd.model;

public record OpenGame(
    String id,
    User user,
    int dim,
    int handicap) {

  public OpenGame withId(String id) {
    return new OpenGame(id, user, dim, handicap);
  }
}
