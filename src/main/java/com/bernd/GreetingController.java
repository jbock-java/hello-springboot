package com.bernd;

import com.bernd.model.Move;
import com.bernd.model.Status;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GreetingController {

  private final MessageSendingOperations<String> operations;

  private int joinCount;

  @Autowired
  public GreetingController(MessageSendingOperations<String> operations) {
    this.operations = operations;
  }

  @MessageMapping("/action")
  public void action(String string) {
    JSONObject message = new JSONObject(string);
    int id = getId(message);
    Intent intent = Intent.getIntent(message);
    if (Intent.JOIN == intent) {
      joinCount++;
      operations.convertAndSend("/topic/lobby",
          joinCount % 2 == 0 ?
              new Status(id, "ready") :
              new Status(id, "waiting"));
    }
    List<String> result = getPosition(message);
    operations.convertAndSend("/topic/greetings", new Move(id, result));
  }

  private List<String> getPosition(JSONObject message) {
    if (!message.has("position")) {
      return Collections.nCopies(9, "");
    }
    JSONArray position = message.getJSONArray("position");
    List<String> result = new ArrayList<>();
    for (Object o : position) {
      result.add(Objects.toString(o, ""));
    }
    return result;
  }

  private int getId(JSONObject message) {
    if (!message.has("id")) {
      return 0;
    }
    Number position = message.getNumber("id");
    return position.intValue();
  }
}
