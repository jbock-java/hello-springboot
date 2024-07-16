package com.bernd.util;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Objects;
import java.util.Random;

public final class RandomString {

  private String nextString() {
    for (int idx = 0; idx < buf.length; ++idx)
      buf[idx] = symbols[random.nextInt(symbols.length)];
    return new String(buf);
  }

  private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  private static final String LOWER = UPPER.toLowerCase(Locale.ROOT);

  private static final String DIGITS = "0123456789";

  private static final String ALPHANUM = UPPER + LOWER + DIGITS;

  private final Random random;

  private final char[] symbols;

  private final char[] buf;

  private RandomString(int length, Random random, String symbols) {
    if (length < 1) throw new IllegalArgumentException();
    if (symbols.length() < 2) throw new IllegalArgumentException();
    this.random = Objects.requireNonNull(random);
    this.symbols = symbols.toCharArray();
    this.buf = new char[length];
  }

  private RandomString(int length, Random random) {
    this(length, random, ALPHANUM);
  }

  private RandomString(int length) {
    this(length, new SecureRandom());
  }

  private RandomString() {
    this(12);
  }

  private static final RandomString INSTANCE = new RandomString();

  public static String get() {
    return INSTANCE.nextString();
  }
}