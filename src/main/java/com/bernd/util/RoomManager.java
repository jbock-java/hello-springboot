package com.bernd.util;

import com.bernd.model.StatusMap;
import com.bernd.model.UserStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoomManager {

  private final Sender sender;
  private final StatusMap statusMap;

  public RoomManager(Sender sender, StatusMap statusMap) {
    this.sender = sender;
    this.statusMap = statusMap;
  }

  public void updateRooms(String user, String room) {
    updateStatus(user, room);
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
