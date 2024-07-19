package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.JoinGameRequest;
import com.bernd.model.Move;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

  private final MessageSendingOperations<String> operations;
  private final Games games;

  GameController(
      MessageSendingOperations<String> operations,
      Games games) {
    this.operations = operations;
    this.games = games;
  }

  @MessageMapping("/game/hello")
  public void gameJoinedAction(JoinGameRequest request) {
    Game game = games.get(request.id());
    operations.convertAndSend("/topic/game/" + request.id(), game);
  }

  @MessageMapping("/game/move")
  public void action(Move move) {
    Game game = games.get(move.id());
    Game updated = game.update(move);
    games.put(updated);
    operations.convertAndSend("/topic/game/" + game.id(), updated);
  }
}
