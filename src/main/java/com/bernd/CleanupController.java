package com.bernd;

import com.bernd.model.StatusMap;
import com.bernd.util.Sender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CleanupController {

  private final Sender sender;
  private final StatusMap statusMap;

  CleanupController(Sender sender, StatusMap statusMap) {
    this.sender = sender;
    this.statusMap = statusMap;
  }

  @Scheduled(fixedDelay = 40 * 1000)
  public void runScheduled() {
    Map<String, List<String>> updatedRooms = statusMap.prune();
    for (Map.Entry<String, List<String>> e : updatedRooms.entrySet()) {
      String room = e.getKey();
      List<String> users = e.getValue();
      sender.sendUsers(room, users);
    }
  }
}
