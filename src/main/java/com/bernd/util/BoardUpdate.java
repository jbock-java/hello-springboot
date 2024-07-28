package com.bernd.util;

import java.util.function.Function;

public interface BoardUpdate extends Function<int[][], int[][]> {

  int size();
}
