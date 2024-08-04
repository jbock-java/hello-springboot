package com.bernd.model;

public record GameMove(
    int n,
    int color,
    boolean pass,
    int x,
    int y,
    boolean counting,
    boolean resetCounting,
    boolean end) {
}
