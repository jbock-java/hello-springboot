package com.bernd;

import com.bernd.game.MoveList;
import com.bernd.model.ActiveGame;
import com.bernd.model.Chat;
import com.bernd.model.ChatMessage;
import com.bernd.model.Game;
import com.bernd.model.MatchRequest;
import com.bernd.model.OpenGame;
import com.bernd.model.ViewGame;
import com.bernd.util.Auth;
import com.bernd.util.RandomString;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final Games games;
  private final OpenGames openGames;
  private final ActiveGames activeGames;
  private final Chats chats;

  LobbyController(
      MessageSendingOperations<String> operations,
      OpenGames openGames,
      Games games,
      ActiveGames activeGames,
      Chats chats) {
    this.operations = operations;
    this.games = games;
    this.openGames = openGames;
    this.activeGames = activeGames;
    this.chats = chats;
  }

  @GetMapping(value = "/api/lobby/hello")
  public ResponseEntity<?> sayHello() {
    String principal = Auth.getPrincipal();
    operations.convertAndSend("/topic/lobby/open_games", Map.of("games", openGames.games()));
    operations.convertAndSend("/topic/lobby/active_games", Map.of("games", activeGames.games()));
    return ResponseEntity.ok().build();
  }

  @ResponseBody
  @GetMapping(value = "/api/lobby/active_games")
  public Map<String, List<ActiveGame>> getActiveGames() {
    return Map.of("games", activeGames.games());
  }

  @ResponseBody
  @GetMapping(value = "/api/lobby/open_games")
  public Map<String, List<OpenGame>> getOpenGames() {
    return Map.of("games", openGames.games());
  }

  @ResponseBody
  @PostMapping(value = "/api/start_edit", consumes = "application/json")
  public ViewGame startEdit(@RequestBody MatchRequest request) {
    String principal = Auth.getPrincipal();
    Game game = games.put(new Game(
        RandomString.get(),
        principal,
        principal,
        Game.STATE_NORMAL,
        createEmptyBoard(request.dim()),
        request.dim(),
        request.timesetting(),
        System.currentTimeMillis(),
        request.handicap(),
        new int[]{-1, -1},
        MoveList.create(request.dim())));
    Chat chat = chats.get(game.id());
    ChatMessage startMessage = ChatMessage.createStartMessage(chat, game);
    chat.messages().add(startMessage);
    return game.toView();
  }

  public static int[][] createEmptyBoard(int dimension) {
    int dim = Math.max(dimension, 2);
    int[][] board = new int[dim][];
    for (int y = 0; y < dim; y++) {
      board[y] = new int[dim];
    }
    return board;
  }
}
