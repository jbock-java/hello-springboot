package com.bernd.config;

import com.bernd.util.AuthFilter;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@Order(SecurityProperties.BASIC_AUTH_ORDER - 10)
public class SecurityConfig {

  private final AuthFilter authFilter;

  public SecurityConfig(AuthFilter authFilter) {
    this.authFilter = authFilter;
  }

  // https://www.springboottutorial.com/securing-rest-services-with-spring-boot-starter-security
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
    http.csrf(AbstractHttpConfigurer::disable);
    http.addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);
    http.sessionManagement(sessionConfigurer -> {
      sessionConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    });
    return http.build();
  }
}
