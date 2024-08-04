import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  BLACK,
  WHITE,
} from "./util.js"
import {
  PointList,
} from "./model/PointList.js"
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

export const useAuthStore = create((set) => ({
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
}))

export const useGameStore = create((set, get) => ({
  moves: [],
  baseBoard: [],
  queueStatus: "behind",
  editMode: false,
  black: {
    name: "",
  },
  white: {
    name: "",
  },
  isInCountingGroup: undefined,
  setIsInCountingGroup: (has) => {
    set(produce(state => {
      state.isInCountingGroup = has
    }))
  },
  currentPlayer: () => {
    return get().gameState.currentColor === WHITE ?
        get().white.name :
        get().black.name
  },
  queueLength: () => {
    return get().moves.length
  },
  gameState: {
    board: [],
    currentColor: BLACK,
    counting: false,
    forbidden: [-1, -1],
  },
  addMove: (move) => {
    set(produce(state => {
      if (move.n < get().moves.length) {
        return
      }
      if (get().moves.length < move.n) {
        state.queueStatus = "behind"
        return
      }
      state.queueStatus = "up_to_date"
      if (move.counting) {
        state.moves.push({...move, dead: PointList.empty()})
        state.gameState.counting = true
        if (move.resetCounting) {
          let updated = count(resetCounting(get().baseBoard))
          state.baseBoard = updated
          state.gameState.board = rehydrate(updated)
        } else {
          let updated = count(toggleStonesAt(get().baseBoard, move.x, move.y))
          state.baseBoard = updated
          state.gameState.board = rehydrate(updated)
        }
        return
      }
      let [dead, updated] = updateBoard(get().baseBoard, move)
      let storedMove = {...move, dead}
      state.moves.push(storedMove)
      state.baseBoard = updated
      state.gameState.board = rehydrate(updated)
      state.gameState.currentColor = get().gameState.currentColor ^ (BLACK | WHITE)
      state.gameState.forbidden = getForbidden(get().baseBoard, updated, storedMove)
    }))
  },
  setGameState: (game) => {
    set(produce(state => {
      state.black = game.black
      state.white = game.white
      state.editMode = game.editMode
      state.baseBoard = game.board
      state.moves = game.moves
      state.gameState.board = rehydrate(game.board)
      state.gameState.currentColor = game.currentColor
      state.gameState.counting = game.counting
      state.gameState.forbidden = game.forbidden
      state.queueStatue = "up_to_date"
    }))
  },
}))
