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
  WHITE,
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
  black: {
    name: "",
  },
  white: {
    name: "",
  },
  countingComplete: () => {
    if (!get().counting()) {
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
      return black.name
    }
    if (!moves.length) {
      return black.name
    }
    return moves[moves.length - 1].color === BLACK ? white.name : black.name
  },
  queueLength: () => {
    return get().moves.length
  },
  currentColor: () => {
    let moves = get().moves
    let handicap = get().handicap
    if (handicap > moves.length) {
      return BLACK
    }
    if (!moves.length) {
      return BLACK
    }
    return moves[moves.length - 1].color ^ (BLACK | WHITE)
  },
  counting: () => {
    let moves = get().moves
    if (!moves.length) {
      return false
    }
    return moves[moves.length - 1].counting
  },
  gameState: {
    board: [],
    forbidden: [-1, -1],
    gameHasEnded: false,
  },
  addMove: (move) => {
    set(produce(state => {
      if (move.end) {
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
      let [storedMove, updated, forbidden] = createMoveData(baseBoard, moves, move)
      state.moves.push(storedMove)
      state.baseBoard = updated
      state.gameState.board = rehydrate(updated)
      state.gameState.forbidden = forbidden
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
      for (let move of game.moves) {
        if (move.end) {
          moves.push(move)
          state.gameState.gameHasEnded = true
          break
        }
        let [storedMove, updated, newForbidden] = createMoveData(baseBoard, moves, move)
        moves.push(storedMove)
        forbidden = newForbidden
        baseBoard = updated
      }
      state.dim = game.dim
      state.baseBoard = baseBoard
      state.moves = moves
      state.gameState.board = rehydrate(baseBoard)
      state.gameState.forbidden = forbidden
      state.handicap = game.handicap
      state.queueStatus = "up_to_date"
    }))
  },
}))

function createMoveData(baseBoard, moves, move) {
  if (move.counting) {
    let updated = move.resetCounting ?
      resetCounting(baseBoard) :
      toggleStonesAt(baseBoard, move.x, move.y)
    return [move, count(updated), [-1, -1]]
  }
  let [dead, updated] = updateBoard(baseBoard, move)
  let storedMove = {...move, dead}
  let forbidden = getForbidden(baseBoard, updated, storedMove)
  return [storedMove, updated, forbidden]
}
