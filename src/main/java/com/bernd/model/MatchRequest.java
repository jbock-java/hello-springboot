package com.bernd.model;

public record MatchRequest(
    int dim,
    int timesetting,
    boolean editMode,
    int handicap) {
}
