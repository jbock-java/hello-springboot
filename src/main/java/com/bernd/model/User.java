package com.bernd.model;

import java.util.Objects;

public final class User {

  private final String name;
  private String currentGame;

  public User(String name) {
    this.name = name;
  }

  public String name() {
    return name;
  }

  public String currentGame() {
    return currentGame;
  }

  public void setCurrentGame(String currentGame) {
    this.currentGame = currentGame;
  }

  @Override
  public boolean equals(Object obj) {
    if (obj == this) return true;
    if (obj == null || obj.getClass() != this.getClass()) return false;
    var that = (User) obj;
    return Objects.equals(this.name, that.name);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name);
  }

  @Override
  public String toString() {
    return "User[" +
        "name=" + name + ']';
  }

}