package com.bernd.util;

import com.bernd.model.StatusMap;
import com.bernd.model.UserStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class RoomManager {

  private static final long SCAN_TIMEOUT = 15 * 1000;

  private final Sender sender;
  private final StatusMap statusMap;
  private long lastScan;

  public RoomManager(Sender sender, StatusMap statusMap) {
    this.sender = sender;
    this.statusMap = statusMap;
  }

  public void updateRooms(String user, String room) {
    updateStatus(user, room);
    if (lastScan + SCAN_TIMEOUT < System.currentTimeMillis()) {
      Map<String, List<String>> updatedRooms = statusMap.prune();
      for (Map.Entry<String, List<String>> e : updatedRooms.entrySet()) {
        String r = e.getKey();
        List<String> users = e.getValue();
        sender.sendUsers(r, users);
      }
      lastScan = System.currentTimeMillis();
    }
  }

  public void updateStatus(String user, String room) {
    UserStatus old = statusMap.put(user, UserStatus.create(room));
    List<String> users = statusMap.usersInRoom(room);
    if (old == null) {
      sender.sendUsers(room, users);
    } else if (!old.room().equals(room)) {
      sender.sendUsers(room, users);
      sender.sendUsers(old.room(), statusMap.usersInRoom(old.room()));
    }
  }
}
