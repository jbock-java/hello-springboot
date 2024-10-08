package com.bernd.util;

import com.bernd.model.StatusMap;
import com.bernd.model.UserStatus;
import java.util.List;
import org.springframework.stereotype.Component;

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
    UserStatus old = statusMap.put(user, room);
    List<String> users = statusMap.usersInRoom(room);
    if (old == null) {
      sender.sendUsers(room, users);
    } else if (!old.room().equals(room)) {
      sender.sendUsers(room, users);
      sender.sendUsers(old.room(), statusMap.usersInRoom(old.room()));
    }
  }

  public void login(String user) {
    updateStatus(user, "lobby");
  }

  public void logout(String user) {
    String room = statusMap.remove(user);
    if (room == null) {
      return;
    }
    List<String> users = statusMap.usersInRoom(room);
    sender.sendUsers(room, users);
  }
}
