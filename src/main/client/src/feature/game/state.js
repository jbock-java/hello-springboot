import {
  produce,
} from "immer"
import {
  BLACK,
  WHITE,
  COLORS,
} from "src/util.js"
import {
  rehydrate,
} from "src/model/board.js"
import {
  updateBoard,
} from "src/model/base.js"
import {
  getForbidden,
} from "src/model/ko.js"
import {
  count,
  toggleStonesAt,
  resetCounting,
} from "src/model/count.js"

export function initialState() {
  return {
    id: "",
    moves: [],
    baseBoard: [],
    dim: 0,
    handicap: 0,
    queueStatus: "behind",
    black: "",
    white: "",
    myColor: 0,
    counting: false,
    queueLength: 0,
    lastMove: undefined,
    board: [],
    forbidden: [-1, -1],
  }
}

export function countingComplete({dim, counting, baseBoard}) {
  if (!counting) {
    return false
  }
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      if (!baseBoard[y][x]) {
        return false
      }
    }
  }
  return true
}

export function currentPlayer({moves, white, black, handicap}) {
  if (handicap > moves.length) {
    return black
  }
  if (!moves.length) {
    return black
  }
  return moves[moves.length - 1].color === BLACK ? white : black
}

export function isSelfPlay({black, white}) {
  return black === white
}

export function currentColor({moves, handicap}) {
  if (handicap > moves.length) {
    return BLACK
  }
  if (!moves.length) {
    return BLACK
  }
  return moves[moves.length - 1].color ^ COLORS
}

export function countingAgreed ({moves, myColor}) {
  if (!moves.length) {
    return false
  }
  let move = moves[moves.length - 1]
  return move.color === myColor && move.action === "agreeCounting"
}

export function gameHasEnded({moves}) {
  if (!moves.length) {
    return false
  }
  let move = moves[moves.length - 1]
  return move.action === "end"
}

export function addMove(baseState, move) {
  return produce(baseState, (draft) => {
    let {action, n} = move
    if (action === "end") {
      draft.moves.push(move)
      return
    }
    let {moves, baseBoard, counting, queueLength} = baseState
    if (n < moves.length) {
      return
    }
    if (moves.length < n) {
      draft.queueStatus = "behind"
      return
    }
    draft.queueStatus = "up_to_date"
    if (!counting) {
      draft.queueLength = queueLength + 1
    }
    let [storedMove, updated, forbidden] = createMoveData(baseBoard, moves, move, counting)
    draft.moves.push(storedMove)
    draft.lastMove = action === "pass" ? undefined : storedMove
    draft.baseBoard = updated
    draft.board = rehydrate(updated)
    draft.forbidden = forbidden
    if (action === "pass" && moves.length && moves[moves.length - 1].action === "pass") {
      draft.counting = true
    }
  })
}

export function createGameState(game, auth) {
  let baseBoard = Array(game.dim)
  for (let y = 0; y < game.dim; y++) {
    baseBoard[y] = new Int32Array(game.dim)
  }
  let moves = []
  let forbidden = [-1, -1]
  let passes = 0
  let counting = false
  let queueLength = 0
  for (let move of game.moves) {
    if (move.action === "end") {
      moves.push(move)
      break
    }
    if (move.action === "pass") {
      if (passes) {
        counting = true
        queueLength = move.n
      } else {
        passes = 1
      }
    } else {
      passes = 0
    }
    let [storedMove, updated, newForbidden] = createMoveData(baseBoard, moves, move, counting)
    moves.push(storedMove)
    forbidden = newForbidden
    baseBoard = updated
  }
  let result = {
    id: game.id,
    black: game.black,
    white: game.white,
    dim: game.dim,
    handicap: game.handicap,
    counting: counting,
    baseBoard: baseBoard,
    moves: moves,
    board: rehydrate(baseBoard),
    forbidden: forbidden,
    queueLength: queueLength || moves.length,
    queueStatus: "up_to_date",
  }
  if (auth.name === game.black) {
    result.myColor = BLACK
  } else if (auth.name === game.white) {
    result.myColor = WHITE
  } else {
    result.myColor = 0
  }
  if (moves.length) {
    let lastMove = moves[moves.length - 1]
    if (lastMove.action !== "pass") {
      result.lastMove = lastMove
    }
  }
  return result
}

function createMoveData(baseBoard, moves, move, counting) {
  if (move.action === "agreeCounting") {
    return [move, baseBoard, [-1, -1]]
  }
  if (move.action === "pass" && moves.length && moves[moves.length - 1].action === "pass") {
    return [move, count(baseBoard), [-1, -1]]
  }
  if (counting) {
    let updated = move.action === "resetCounting" ?
      resetCounting(baseBoard) :
      toggleStonesAt(baseBoard, move.x, move.y)
    return [move, count(updated), [-1, -1]]
  }
  let [dead, updated] = updateBoard(baseBoard, move)
  let storedMove = {...move, dead}
  let forbidden = getForbidden(baseBoard, updated, storedMove)
  return [storedMove, updated, forbidden]
}
