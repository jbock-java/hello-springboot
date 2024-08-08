package com.bernd;

import com.bernd.game.Board;
import com.bernd.game.MoveList;
import com.bernd.model.AcceptRequest;
import com.bernd.model.ActiveGame;
import com.bernd.model.Game;
import com.bernd.model.GameMove;
import com.bernd.model.Move;
import com.bernd.model.OpenGame;
import com.bernd.model.ViewGame;
import com.bernd.util.RandomString;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

import static com.bernd.util.Auth.getPrincipal;
import static com.bernd.util.Util.COLORS;

@Controller
public class GameController {

  private final MessageSendingOperations<String> operations;
  private final Users users;
  private final Games games;
  private final OpenGames openGames;
  private final ActiveGames activeGames;

  GameController(
      MessageSendingOperations<String> operations,
      Users users,
      Games games,
      OpenGames openGames,
      ActiveGames activeGames) {
    this.operations = operations;
    this.users = users;
    this.games = games;
    this.openGames = openGames;
    this.activeGames = activeGames;
  }

  @ResponseBody
  @GetMapping(value = "/api/game/{id}")
  public ViewGame getGame(@PathVariable String id, Principal p) {
    users.get(p).setCurrentGame(id);
    Game game = games.get(id);
    if (game == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "no such game");
    }
    return game.toView();
  }

  @MessageMapping("/game/move")
  public void action(Move move, Principal p) {
    Game game = games.get(users.get(p).currentGame());
    if (p == null || game == null) {
      return;
    }
    int color = getCurrentColor(game, getPrincipal(p));
    if (color == 0) {
      return;
    }
    Move updatedMove = move.withColor(color).withMoveNumber(game.moves().size());
    Game updated = game.update(updatedMove);
    games.put(updated);
    GameMove lastMove = game.getLastMove();
    operations.convertAndSend("/topic/move/" + game.id(), lastMove);
  }

  private int getCurrentColor(Game game, String principal) {
    if (game.gameHasEnded()) {
      return 0;
    }
    if (game.remainingHandicap() != 0) {
      return Board.B;
    }
    int color = getColor(game, principal);
    if (color == 0) {
      return 0;
    }
    MoveList moves = game.moves();
    if (moves.isEmpty()) {
      return Board.B;
    }
    return moves.get(moves.size() - 1).color() ^ COLORS;
  }

  private static int getColor(Game game, String principal) {
    if (!(game.isBlack(principal) || game.isWhite(principal))) {
      return 0;
    }
    if (game.remainingHandicap() > 0) {
      if (!game.isBlack(principal)) {
        return 0;
      }
      return Board.B;
    }
    if (game.isSelfPlay()) {
      return game.moves().size() + game.remainingHandicap() % 2 == 0 ?
          Board.B : Board.W;
    }
    return game.isBlack(principal) ? Board.B : Board.W;
  }

  @ResponseBody
  @PostMapping(value = "/api/create", consumes = "application/json")
  public OpenGame newGame(@RequestBody OpenGame game) {
    String principal = getPrincipal();
    OpenGame result = openGames.put(game.withUser(principal)
        .withId(RandomString.get()));
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    return result;
  }

  @PostMapping(value = "/api/accept", consumes = "application/json")
  public ResponseEntity<?> accept(@RequestBody AcceptRequest acceptRequest) {
    String principal = getPrincipal();
    openGames.remove(principal);
    OpenGame openGame = openGames.remove(acceptRequest.game().user());
    Game fullGame = games.put(openGame.accept(principal, acceptRequest));
    activeGames.put(ActiveGame.fromGame(fullGame));
    operations.convertAndSend("/topic/game/" + fullGame.id(), fullGame.toView());
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    operations.convertAndSend("/topic/lobby/active_games", activeGames.games());
    return ResponseEntity.ok().build();
  }
}
