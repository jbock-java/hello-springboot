package com.bernd.model;

public record GameMove(
    int n,
    int color,
    boolean pass,
    int x,
    int y,
    boolean resetCounting,
    boolean agreeCounting,
    boolean end) {
}
