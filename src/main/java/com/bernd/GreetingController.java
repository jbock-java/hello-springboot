package com.bernd;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GreetingController {

    private final MessageSendingOperations<String> operations;

    @Autowired
    public GreetingController(MessageSendingOperations<String> operations) {
        this.operations = operations;
    }

    @MessageMapping("/hello")
    public void greeting(String string) {
        JSONObject message = new JSONObject(string);
        operations.convertAndSend("/topic/greetings", new Greeting(message.getString("name")));
    }
}
