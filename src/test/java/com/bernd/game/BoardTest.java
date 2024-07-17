package com.bernd.game;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BoardTest {

  @Test
  void testRemoveDeadStonesAround() {
    List<List<String>> position = List.of(
        List.of("b", "w", "", "", "", "", "", "", ""),
        List.of("w", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", ""),
        List.of("", "", "", "", "", "", "", "", "")
    );
    List<List<String>> result = Board.removeDeadStonesAround(position, 0, 1);
    assertEquals(List.of("", "w", "", "", "", "", "", "", ""), result.get(0));
    assertEquals(position.subList(1, position.size()), result.subList(1, result.size()));
  }
}