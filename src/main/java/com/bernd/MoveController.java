package com.bernd;

import com.bernd.model.Move;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class MoveController {

    private final MessageSendingOperations<String> operations;

    MoveController(MessageSendingOperations<String> operations) {
        this.operations = operations;
    }

    @MessageMapping("/move")
    public void action(Move move) {
        operations.convertAndSend("/topic/game", move);
    }
}