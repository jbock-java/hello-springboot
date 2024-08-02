package com.bernd;

import com.bernd.model.AcceptRequest;
import com.bernd.model.ActiveGame;
import com.bernd.model.CountingMove;
import com.bernd.model.Game;
import com.bernd.model.Move;
import com.bernd.model.OpenGame;
import com.bernd.model.ViewGame;
import com.bernd.util.Auth;
import com.bernd.util.RandomString;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;

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

  @ResponseBody
  @GetMapping(value = "/api/game/{id}")
  public ViewGame getGame(@PathVariable String id) {
    Game game = games.get(id);
    if (game == null) {
      return null;
    }
    return game.toView();
  }

  @MessageMapping("/game/move")
  public void action(Move move, Principal principal) {
    Game game = games.get(move.id());
    if (game == null) {
      return;
    }
    int moveNumber = game.moves().size();
    int color = game.currentColor();
    if (!principal.getName().equals(game.currentPlayer())) {
      return; // discard
    }
    Game updated = game.update(move);
    games.put(updated);
    if (updated.counting()) {
      operations.convertAndSend("/topic/move/" + game.id(), CountingMove.create(color, moveNumber, updated.board()));
    } else {
      operations.convertAndSend("/topic/move/" + game.id(), move.toView(color, moveNumber, updated.forbidden()));
    }
  }

  @ResponseBody
  @PostMapping(value = "/api/create", consumes = "application/json")
  public OpenGame newGame(@RequestBody OpenGame game) {
    String principal = Auth.getPrincipal();
    OpenGame result = openGames.put(game.withUser(principal)
        .withId(RandomString.get()));
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    return result;
  }

  @PostMapping(value = "/api/accept", consumes = "application/json")
  public ResponseEntity<?> accept(@RequestBody AcceptRequest acceptRequest) {
    String principal = Auth.getPrincipal();
    openGames.remove(principal);
    OpenGame openGame = openGames.remove(acceptRequest.game().user().name());
    Game fullGame = games.put(openGame.accept(principal, acceptRequest));
    activeGames.put(ActiveGame.fromGame(fullGame));
    operations.convertAndSend("/topic/game/" + fullGame.id(), fullGame.toView());
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    operations.convertAndSend("/topic/lobby/active_games", activeGames.games());
    return ResponseEntity.ok().build();
  }
}
