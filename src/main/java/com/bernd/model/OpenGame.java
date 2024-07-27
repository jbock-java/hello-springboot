package com.bernd.model;

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
}
