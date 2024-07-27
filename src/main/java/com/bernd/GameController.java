package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.JoinGameRequest;
import com.bernd.model.Move;
import com.bernd.model.OpenGame;
import com.bernd.model.OpenGameList;
import com.bernd.util.RandomString;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class GameController {

  private final MessageSendingOperations<String> operations;
  private final Games games;
  private final OpenGames openGames;

  GameController(
      MessageSendingOperations<String> operations,
      Games games,
      OpenGames openGames) {
    this.operations = operations;
    this.games = games;
    this.openGames = openGames;
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

  @PostMapping(value = "/api/create", consumes = "application/json")
  @ResponseBody
  public ResponseEntity<?> newGame(@RequestBody OpenGame openGame) {
    openGames.put(RandomString.get(), openGame);
    operations.convertAndSend("/topic/lobby/open",
        new OpenGameList(openGames.games()));
    return ResponseEntity.ok().build();
  }
}
