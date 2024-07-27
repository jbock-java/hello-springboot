package com.bernd;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.core.env.Environment;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.util.List;

class UserInterceptor implements ChannelInterceptor {

  private final JWTVerifier verifier;

  private UserInterceptor(JWTVerifier verifier) {
    this.verifier = verifier;
  }

  static UserInterceptor create(Environment environment) {
    Algorithm algorithm = Algorithm.HMAC512(environment.getProperty("jwt.secret.key"));
    return new UserInterceptor(JWT.require(algorithm).build());
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      List<String> tokens = accessor.getNativeHeader("token");
      if (tokens.isEmpty()) {
        return null;
      }
      DecodedJWT jwt = verifier.verify(tokens.get(0));
      Claim name = jwt.getClaim("name");
      if (name.asString() == null) {
        return null;
      }
      accessor.setUser(new StompUser(name.asString()));
    }
    return message;
  }
}
