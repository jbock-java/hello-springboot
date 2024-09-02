package com.bernd.config;

import java.security.Principal;

public final class StompUser implements Principal {

  private final String name;

  StompUser(String name) {
    this.name = name;
  }

  @Override
  public String getName() {
    return name;
  }
}