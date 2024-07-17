package com.bernd.game;

import java.util.List;

public record StoneGroup(
    int id,
    String color,
    List<Point> points,
    int liberties
) {
}
