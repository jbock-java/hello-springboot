package com.bernd;

import com.bernd.game.Board;
import com.bernd.game.MoveList;
import com.bernd.model.AcceptRequest;
import com.bernd.model.ActiveGame;
import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.Game;
import com.bernd.model.Move;
import com.bernd.model.OpenGame;
import com.bernd.model.ViewGame;
import com.bernd.util.RandomString;
import com.bernd.util.SgfCreator;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import java.time.LocalDate;

import static com.bernd.util.Auth.getPrincipal;
import static com.bernd.util.Util.COLORS;

@Controller
public class GameController {

  private final MessageSendingOperations<String> operations;
  private final Users users;
  private final Games games;
  private final OpenGames openGames;
  private final ActiveGames activeGames;
  private final Chats chats;

  GameController(
      MessageSendingOperations<String> operations,
      Users users,
      Games games,
      OpenGames openGames,
      ActiveGames activeGames, Chats chats) {
    this.operations = operations;
    this.users = users;
    this.games = games;
    this.openGames = openGames;
    this.activeGames = activeGames;
    this.chats = chats;
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
    if (game.gameHasEnded()) {
      return;
    }
    int principalColor = getColorFromPrincipal(game, getPrincipal(p));
    if (principalColor == 0) {
      return;
    }
    int color = getColorFromGameState(game);
    Chat chat = chats.get(game.id());
    if (System.currentTimeMillis() > game.updated() + game.timesetting() * 1000L) {
      games.put(game.withTimeoutState());
      String text = color == Board.W ? "B+Time" : "W+Time";
      ChatMessage message = new ChatMessage(chat.counter().getAndIncrement(), text, null, "status", null);
      chat.messages().add(message);
      operations.convertAndSend("/topic/chat/" + chat.id(), message);
      operations.convertAndSend("/topic/move/" + game.id(), game.getLastMove());
      return;
    }
    if (!game.isCounting() && !game.isSelfPlay() && color != principalColor) {
      return;
    }
    if (game.isForbidden(move)) {
      return;
    }
    Game updated = game.update(move
        .withCount(game.moves().size())
        .withColor(game.isSelfPlay() ? color : principalColor));
    games.put(updated);
    Move lastMove = game.getLastMove();
    if (lastMove.end()) {
      ChatMessage message = new ChatMessage(chat.counter().getAndIncrement(), game.getScore(), null, "status", null);
      chat.messages().add(message);
      operations.convertAndSend("/topic/chat/" + chat.id(), message);
    }
    operations.convertAndSend("/topic/move/" + game.id(), lastMove);
  }

  private int getColorFromGameState(Game game) {
    if (game.remainingHandicap() > 0) {
      return Board.B;
    }
    MoveList moves = game.moves();
    if (moves.isEmpty()) {
      return Board.B;
    }
    return moves.get(moves.size() - 1).color() ^ COLORS;
  }

  private static int getColorFromPrincipal(Game game, String principal) {
    if (game.isBlack(principal)) {
      return Board.B;
    }
    if (game.isWhite(principal)) {
      return Board.W;
    }
    return 0;
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
    Chat chat = chats.get(openGame.id());

    ChatMessage startMessage = ChatMessage.createStartMessage(chat, fullGame);
    chat.messages().add(startMessage);
    operations.convertAndSend("/topic/chat/" + chat.id(), startMessage);
    operations.convertAndSend("/topic/game/" + fullGame.id(), fullGame.toView());
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    operations.convertAndSend("/topic/lobby/active_games", activeGames.games());
    return ResponseEntity.ok().build();
  }

  @GetMapping("/api/sgf/{id}/{black}_vs_{white}.sgf")
  public ResponseEntity<String> getSgf(
      @PathVariable String id) {
    Game game = games.get(id);
    if (game == null) {
      return ResponseEntity.notFound().build();
    }
    String sgf = SgfCreator.createSgf(game, LocalDate.now());
    return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(sgf);
  }
}
