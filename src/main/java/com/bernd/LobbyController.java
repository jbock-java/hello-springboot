package com.bernd;

import com.bernd.model.Game;
import com.bernd.model.MatchRequest;
import com.bernd.model.Status;
import com.bernd.model.User;
import com.bernd.model.UserList;
import com.bernd.util.RandomString;
import java.security.Principal;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import static com.bernd.game.Board.B;

@Controller
public class LobbyController {

  private final MessageSendingOperations<String> operations;
  private final LobbyUsers lobbyUsers;
  private final Games games;
  private User lookingForMatch;

  LobbyController(
      MessageSendingOperations<String> operations,
      LobbyUsers lobbyUsers,
      Games games) {
    this.operations = operations;
    this.lobbyUsers = lobbyUsers;
    this.games = games;
  }

  @MessageMapping("/lobby/hello")
  public void lobbyJoinedAction(Principal principal) {
    lobbyUsers.add(principal);
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
  }

  @MessageMapping("/lobby/match")
  public void matchAction(MatchRequest request, Principal principal) {
    User user = lobbyUsers.get(principal);
    if (request.editMode()) {
      lobbyUsers.remove(principal.getName());
      operations.convertAndSend("/topic/lobby/users",
          new UserList(lobbyUsers.users()));
      Game game = games.put(new Game(
          RandomString.get(),
          user,
          user,
          true,
          false,
          user.name(),
          B,
          false,
          createEmptyBoard(request),
          0));
      operations.convertAndSend("/topic/lobby/gamestart", game);
      return;
    }
    if (lookingForMatch == null) {
      lookingForMatch = user;
      operations.convertAndSend("/topic/lobby/gamerequest",
          new Status(request.name(), "ready"));
      return;
    }
    User black = lookingForMatch;
    lookingForMatch = null;
    lobbyUsers.remove(principal.getName());
    lobbyUsers.remove(black.name());
    operations.convertAndSend("/topic/lobby/users",
        new UserList(lobbyUsers.users()));
    Game game = games.put(new Game(
        RandomString.get(),
        black,
        user,
        false,
        false,
        user.name(),
        B,
        false,
        createEmptyBoard(request),
        0));
    operations.convertAndSend("/topic/lobby/gamestart", game);
  }

  private static int[][] createEmptyBoard(MatchRequest request) {
    int dim = Math.max(request.dim(), 2);
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
