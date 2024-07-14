package com.bernd;

import java.security.Principal;

public final class StompUser implements Principal {

  private final int name;

  public StompUser(int name) {
    this.name = name;
  }

  @Override
  public String getName() {
    return Integer.toString(name);
  }
}
