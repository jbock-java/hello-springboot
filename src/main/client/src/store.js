import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  persist,
} from "zustand/middleware"
import {
  BLACK,
  COLORS,
} from "./util.js"
import {
  rehydrate,
} from "./model/board.js"
import {
  updateBoard,
} from "./model/base.js"
import {
  getForbidden,
} from "./model/ko.js"
import {
  count,
  toggleStonesAt,
  resetCounting,
} from "./model/count.js"

export const useAuthStore = create(
  persist(
    (set) => ({
      auth: {
        name: "",
        state: "anonymous",
        token: "",
      },
      setAuth: (payload) => {
        set(produce(state => {
          state.auth.name = payload.name
          state.auth.state = "authenticated"
          state.auth.token = payload.token
        }))
      },
      setPending: (b) => {
        set(produce(state => {
          state.auth.state = b ? "pending" : "anonymous"
        }), true)
      },
    }),
    { name: "auth-storage" },
  ),
)

export const useGameStore = create((set, get) => ({
  moves: [],
  baseBoard: [],
  dim: 0,
  handicap: 0,
  queueStatus: "behind",
  black: "",
  white: "",
  lastMove: undefined,
  countingComplete: () => {
    if (!get().counting) {
      return false
    }
    let baseBoard = get().baseBoard
    let dim = get().dim
    for (let y = 0; y < dim; y++) {
      for (let x = 0; x < dim; x++) {
        if (!baseBoard[y][x]) {
          return false
        }
      }
    }
    return true
  },
  currentPlayer: () => {
    let moves = get().moves
    let white = get().white
    let black = get().black
    let handicap = get().handicap
    if (handicap > moves.length) {
      return black
    }
    if (!moves.length) {
      return black
    }
    return moves[moves.length - 1].color === BLACK ? white : black
  },
  queueLength: 0,
  currentColor: () => {
    let moves = get().moves
    let handicap = get().handicap
    if (handicap > moves.length) {
      return BLACK
    }
    if (!moves.length) {
      return BLACK
    }
    return moves[moves.length - 1].color ^ COLORS
  },
  counting: false,
  agreeCounting: false,
  setAgreeCounting: (agree) => {
    set(produce(state => {
      state.agreeCounting = agree
    }))
  },
  gameState: {
    board: [],
    forbidden: [-1, -1],
    gameHasEnded: false,
  },
  addMove: (move) => {
    set(produce(state => {
      if (move.action === "end") {
        state.moves.push(move)
        state.gameState.gameHasEnded = true
        return
      }
      let moves = get().moves
      let baseBoard = get().baseBoard
      if (move.n < moves.length) {
        return
      }
      if (moves.length < move.n) {
        state.queueStatus = "behind"
        return
      }
      state.queueStatus = "up_to_date"
      let counting = get().counting
      if (!counting) {
        state.queueLength = get().queueLength + 1
      }
      let [storedMove, updated, forbidden] = createMoveData(baseBoard, moves, move, counting, get().handicap)
      state.moves.push(storedMove)
      if (move.action !== "agreeCounting") {
        state.agreeCounting = false
      }
      state.lastMove = move.action === "pass" ? undefined : storedMove
      state.baseBoard = updated
      state.gameState.board = rehydrate(updated)
      state.gameState.forbidden = forbidden
      if (move.action === "pass" && moves.length && moves[moves.length - 1].action === "pass") {
        state.counting = true
      }
    }))
  },
  setGameState: (game) => {
    set(produce(state => {
      state.black = game.black
      state.white = game.white
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
          state.gameState.gameHasEnded = true
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
        let [storedMove, updated, newForbidden] = createMoveData(baseBoard, moves, move, counting, game.handicap)
        moves.push(storedMove)
        forbidden = newForbidden
        baseBoard = updated
      }
      if (game.moves.length) {
        let move = game.moves[game.moves.length - 1]
        state.lastMove = move.action === "pass" ? undefined : move
      }
      state.counting = counting
      state.dim = game.dim
      state.baseBoard = baseBoard
      state.moves = moves
      state.gameState.board = rehydrate(baseBoard)
      state.gameState.forbidden = forbidden
      state.handicap = game.handicap
      state.queueLength = queueLength
      state.queueStatus = "up_to_date"
    }))
  },
}))

function createMoveData(baseBoard, moves, colorlessMove, counting, handicap) {
  let move = {...colorlessMove, color: nextMoveColor(moves, handicap)}
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

function nextMoveColor(moves, handicap) {
    let remainingHandicap = Math.max(0, handicap - moves.length)
    if (remainingHandicap) {
      return BLACK
    }
    if (!moves.length) {
      return BLACK
    }
    return moves[moves.length - 1].color ^ COLORS
  }
