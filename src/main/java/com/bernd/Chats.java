package com.bernd;

import com.bernd.model.Chat;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class Chats {
  private final Map<String, Chat> map = new LinkedHashMap<>();

  Chat get(String id) {
    return map.get(id);
  }

  Chat put(Chat chat) {
    map.put(chat.id(), chat);
    return chat;
  }

  Map<String, Chat> map() {
    return map;
  }
}
