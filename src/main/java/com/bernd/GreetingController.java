package com.bernd;

import com.bernd.model.Move;
import com.bernd.model.Status;
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
    Intent intent = Intent.getIntent(message);
    if (Intent.JOIN == intent) {
      joinCount++;
      operations.convertAndSend("/topic/lobby",
          joinCount % 2 == 0 ?
              new Status("ready") :
              new Status("waiting"));
    }
    operations.convertAndSend("/topic/greetings", new Move(message.getString("name")));
  }
}
