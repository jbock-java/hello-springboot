package com.bernd;

import com.bernd.model.LoginRequest;
import com.bernd.model.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LoginController {

  private final Users users;

  public LoginController(Users users) {
    this.users = users;
  }

  @PostMapping(value = "/login", consumes = "application/json")
  public ResponseEntity<?> loginAction(
      @RequestBody LoginRequest request) {
    if (users.contains(request.name())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    users.login(request.name());
    return ResponseEntity.ok(new LoginResponse(request.name()));
  }
}