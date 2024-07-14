package com.bernd;

import java.security.Principal;

public final class StompUser implements Principal {

  private final String name;

  StompUser(int name) {
    this.name = Integer.toString(name);
  }

  @Override
  public String getName() {
    return name;
  }
}