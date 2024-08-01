package com.bernd;

import com.bernd.model.ActiveGame;
import com.bernd.model.ActiveGameList;
import com.bernd.model.Game;
import com.bernd.model.MatchRequest;
import com.bernd.model.OpenGameList;
import com.bernd.model.User;
import com.bernd.util.RandomString;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Objects;

import static com.bernd.game.Board.B;

@Controller
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private final Games games;
  private final OpenGames openGames;
  private final ActiveGames activeGames;

  LobbyController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers,
      OpenGames openGames,
      Games games,
      ActiveGames activeGames) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
    this.games = games;
    this.openGames = openGames;
    this.activeGames = activeGames;
  }

  @GetMapping(value = "/api/lobby/hello")
  public ResponseEntity<?> sayHello() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    lobbyUsers.add(Objects.toString(principal));
    operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
    operations.convertAndSend("/topic/lobby/open_games", openGames.games());
    operations.convertAndSend("/topic/lobby/active_games", activeGames.games());
    return ResponseEntity.ok().build();
  }

  @ResponseBody
  @GetMapping(value = "/api/lobby/active_games")
  public ActiveGameList getActiveGames() {
    return activeGames.games();
  }

  @ResponseBody
  @GetMapping(value = "/api/lobby/open_games")
  public OpenGameList getOpenGames() {
    return openGames.games();
  }

  @ResponseBody
  @PostMapping(value = "/api/start_edit", consumes = "application/json")
  public Game startEdit(@RequestBody MatchRequest request) {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    lobbyUsers.remove(Objects.toString(principal));
    User user = new User(Objects.toString(principal));
    operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
    Game game = games.put(new Game(
        RandomString.get(),
        user,
        user,
        true,
        false,
        Objects.toString(principal),
        B,
        false,
        createEmptyBoard(request.dim()),
        0,
        new int[]{-1, -1}));
    activeGames.put(ActiveGame.fromGame(game));
    return game;
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
