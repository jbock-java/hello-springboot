package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import com.bernd.model.User;
import com.bernd.util.RandomString;
import java.security.Principal;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import static com.bernd.game.Board.B;

@Controller
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private final Games games;
  private final OpenGames openGames;
  private User lookingForMatch;

  LobbyController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers,
      OpenGames openGames,
      Games games) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
    this.games = games;
    this.openGames = openGames;
  }

  @GetMapping(value = "/api/lobby/hello")
  public ResponseEntity<?> sayHello() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    lobbyUsers.add(Objects.toString(principal));
    operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
    operations.convertAndSend("/topic/lobby/open", openGames.games());
    return ResponseEntity.ok().build();
  }

  @MessageMapping("/lobby/match")
  public void matchAction(MatchRequest request, Principal principal) {
    User user = lobbyUsers.get(principal);
    if (request.editMode()) {
      lobbyUsers.remove(principal.getName());
      operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
      Game game = games.put(new Game(
          RandomString.get(),
          user,
          user,
          true,
          false,
          user.name(),
          B,
          false,
          createEmptyBoard(request.dim()),
          0,
          new int[]{-1, -1}));
      operations.convertAndSend("/topic/lobby/gamestart", game);
      return;
    }
    if (lookingForMatch == null) {
      lookingForMatch = user;
      operations.convertAndSend("/topic/lobby/gamerequest",
          new Status(principal.getName(), "ready"));
      return;
    }
    User black = lookingForMatch;
    lookingForMatch = null;
    lobbyUsers.remove(principal.getName());
    lobbyUsers.remove(black.name());
    operations.convertAndSend("/topic/lobby/users", lobbyUsers.users());
    Game game = games.put(new Game(
        RandomString.get(),
        black,
        user,
        false,
        false,
        user.name(),
        B,
        false,
        createEmptyBoard(request.dim()),
        0,
        new int[]{-1, -1}));
    operations.convertAndSend("/topic/lobby/gamestart", game);
  }

  public static int[][] createEmptyBoard(int dimension) {
    int dim = Math.max(dimension, 2);
    int[][] board = new int[dim][];
    for (int y = 0; y < dim; y++) {
      board[y] = new int[dim];
    }
//    board = new int[][]{
//        new int[]{0, 0, 0, 0, W, B, 0, 0, 0},
//        new int[]{0, 0, 0, 0, W, B, 0, 0, 0},
//        new int[]{0, 0, W, W, W, B, 0, 0, 0},
//        new int[]{0, 0, W, B, B, B, 0, B, B},
//        new int[]{W, 0, W, B, B, 0, B, W, W},
//        new int[]{B, W, W, B, 0, B, W, W, 0},
//        new int[]{B, B, B, B, W, B, W, 0, 0},
//        new int[]{0, 0, 0, B, B, W, W, 0, 0},
//        new int[]{0, 0, 0, B, W, W, W, 0, 0},
//    };
    return board;
  }
}
