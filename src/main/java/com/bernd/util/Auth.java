package com.bernd.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;
import java.util.Objects;

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

  public static String getPrincipal(Principal principal) {
    if (principal == null) {
      return "";
    }
    return Objects.toString(principal.getName(), "");
  }
}
