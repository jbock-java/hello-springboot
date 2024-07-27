package com.bernd.model;

public record MatchRequest(
    int dim,
    boolean editMode,
    int handicap) {
}
