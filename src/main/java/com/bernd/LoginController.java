package com.bernd;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.bernd.model.Error;
import com.bernd.model.LoginRequest;
import com.bernd.model.LoginResponse;
import com.bernd.model.StatusMap;
import com.bernd.util.RoomManager;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LoginController {

  private final StatusMap statusMap;
  private final RoomManager roomManager;
  private final Environment environment;

  LoginController(
      StatusMap statusMap,
      RoomManager roomManager,
      Environment environment) {
    this.statusMap = statusMap;
    this.roomManager = roomManager;
    this.environment = environment;
  }

  @PostMapping(value = "/login", consumes = "application/json")
  public ResponseEntity<?> loginAction(
      @RequestBody LoginRequest request) {
    if (request.name().isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new Error("The name must not be empty"));
    }
    if (statusMap.contains(request.name())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new Error("Please choose another name"));
    }
    String key = environment.getProperty("jwt.secret.key");
    if (key == null) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new Error("Server configuration error"));
    }
    Algorithm algorithm = Algorithm.HMAC512(key);
    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("name", request.name())
        .sign(algorithm);
    roomManager.login(request.name());
    return ResponseEntity.ok(new LoginResponse(request.name(), token));
  }
}
