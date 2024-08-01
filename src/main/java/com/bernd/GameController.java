package com.bernd;

import com.bernd.model.AcceptRequest;
import com.bernd.model.ActiveGame;
import com.bernd.model.Game;
import com.bernd.model.JoinGameRequest;
import com.bernd.model.Move;
import com.bernd.model.OpenGame;
import com.bernd.util.RandomString;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Objects;

@Controller
public class GameController {

  private final MessageSendingOperations<String> operations;
  private final Games games;
  private final OpenGames openGames;
  private final ActiveGames activeGames;

  GameController(
      MessageSendingOperations<String> operations,
      Games games,
      OpenGames openGames,
      ActiveGames activeGames) {
    this.operations = operations;
    this.games = games;
    this.openGames = openGames;
    this.activeGames = activeGames;
  }

  @PostMapping(value = "/api/game/hello", consumes = "application/json")
  public ResponseEntity<?> sayHello(@RequestBody JoinGameRequest request) {
    Game game = games.get(request.id());
    operations.convertAndSend("/topic/game/" + request.id(), game);
    return ResponseEntity.ok().build();
  }

  @MessageMapping("/game/move")
  public void action(Move move) {
    Game game = games.get(move.id());
    Game updated = game.update(move);
    games.put(updated);
    operations.convertAndSend("/topic/game/" + game.id(), updated);
  }

  @ResponseBody
  @PostMapping(value = "/api/create", consumes = "application/json")
  public OpenGame newGame(@RequestBody OpenGame game) {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    OpenGame result = openGames.put(game.withUser(Objects.toString(principal, ""))
        .withId(RandomString.get()));
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    return result;
  }

  @PostMapping(value = "/api/accept", consumes = "application/json")
  public ResponseEntity<?> accept(@RequestBody AcceptRequest acceptRequest) {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    openGames.remove(Objects.toString(principal));
    OpenGame openGame = openGames.remove(acceptRequest.game().user().name());
    Game fullGame = games.put(openGame.accept(principal.toString(), acceptRequest));
    activeGames.put(ActiveGame.fromGame(fullGame));
    operations.convertAndSend("/topic/game/" + fullGame.id(), fullGame);
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    operations.convertAndSend("/topic/lobby/active_games", activeGames.games());
    return ResponseEntity.ok().build();
  }
}
