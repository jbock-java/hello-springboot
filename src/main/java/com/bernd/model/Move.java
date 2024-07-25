package com.bernd.model;

public record Move(
  String id,
  boolean pass,
  boolean resetCounting,
  int x,
  int y) {
}
