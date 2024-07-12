package com.bernd;

import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class MatchController {

    private final MessageSendingOperations<String> operations;

    private int matchCount;

    @Autowired
    MatchController(MessageSendingOperations<String> operations) {
        this.operations = operations;
    }

    @MessageMapping("/match")
    public void matchAction(MatchRequest message) {
        matchCount++;
        operations.convertAndSend("/topic/lobby",
                matchCount % 2 == 0 ?
                        new Status(message.id(), "ready") :
                        new Status(message.id(), "waiting"));
    }
}
