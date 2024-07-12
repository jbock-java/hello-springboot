package com.bernd;

import com.bernd.model.JoinResponse;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LobbyController {

  private final AtomicInteger counter = new AtomicInteger(0);

  @RequestMapping("/data/join")
  JoinResponse join() {
    return new JoinResponse(Math.max(0, counter.getAndIncrement()));
  }
}
