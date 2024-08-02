package com.bernd.util;

import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class Auth {
  private Auth() {
  }

  public static String getPrincipal() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) {
      return "";
    }
    Object principal = auth.getPrincipal();
    return Objects.toString(principal, "");
  }
}
