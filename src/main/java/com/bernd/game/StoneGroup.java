package com.bernd.game;

import java.util.List;

public record StoneGroup(
    int id,
    int color,
    List<Point> points,
    int liberties
) {
}
