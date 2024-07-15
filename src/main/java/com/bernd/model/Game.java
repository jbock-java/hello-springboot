package com.bernd.model;

import java.util.List;

public record Game(
    String id,
    User black,
    User white
  ) {
}
