package com.bernd.model;

public record ColorlessMove(
    int n,
    boolean pass,
    int x,
    int y,
    boolean resetCounting,
    boolean agreeCounting,
    boolean end) {
}
