package com.bernd.game;

import com.bernd.util.BoardUpdate;

public record StoneGroup(
    BoardUpdate update,
    int liberties
) {
}
