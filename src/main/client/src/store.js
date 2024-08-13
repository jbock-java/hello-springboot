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
  countingAgreed: () => {
    let moves = get().moves
    let myColor = get().myColor
    if (!moves.length) {
      return false
    }
    let move = moves[moves.length - 1]
    return move.color === myColor && move.action === "agreeCounting"
  },
  gameHasEnded: () => {
    let moves = get().moves
    if (!moves.length) {
      return false
    }
    let move = moves[moves.length - 1]
    return move.action === "end"
  },
  addMove: (move) => {
    set(produce(state => {
      if (move.action === "end") {
        state.moves.push(move)
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
      state.lastMove = move.action === "pass" ? undefined : storedMove
      state.baseBoard = updated
      state.board = rehydrate(updated)
      state.forbidden = forbidden
      if (move.action === "pass" && moves.length && moves[moves.length - 1].action === "pass") {
        state.counting = true
      }
    }))
  },
  setGameState: (game, auth) => {
    set(produce(state => {
      state.id = game.id
      state.black = game.black
      state.white = game.white
      state.counting = false
      if (auth.name === game.black) {
        state.myColor = BLACK
      } else if (auth.name === game.white) {
        state.myColor = WHITE
      } else {
        state.myColor = 0
      }
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
      if (moves.length) {
        let move = moves[moves.length - 1]
        state.lastMove = move.action === "pass" ? undefined : move
      } else {
        state.lastMove = undefined
      }
      state.counting = counting
      state.dim = game.dim
      state.baseBoard = baseBoard
      state.moves = moves
      state.board = rehydrate(baseBoard)
      state.forbidden = forbidden
      state.handicap = game.handicap
      state.queueLength = queueLength
      state.queueStatus = "up_to_date"
    }))
  },
}))

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
