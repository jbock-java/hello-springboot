package com.bernd;

import com.bernd.model.Chat;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class Chats {
  private final Map<String, Chat> map = new LinkedHashMap<>();

  Chat get(String id) {
    return map.computeIfAbsent(id,
        _id -> new Chat(id, new AtomicInteger(0), new ArrayList<>()));
  }

  Chat put(Chat chat) {
    map.put(chat.id(), chat);
    return chat;
  }

  Map<String, Chat> map() {
    return map;
  }
}
