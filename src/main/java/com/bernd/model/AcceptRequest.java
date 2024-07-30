package com.bernd.model;

public record AcceptRequest(
    OpenGame game,
    boolean flip,
    int handicap) {
}
