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
  rehydrate,
} from "./model/board.js"
import {
  updateBoard,
} from "./model/base.js"

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
  gameState: {
    board: [],
    currentPlayer: undefined,
    currentColor: BLACK,
    counting: false,
    forbidden: [-1, -1],
  },
  addMove: (move) => {
    set(produce(state => {
      if (get().moves.length < move.n) {
        state.queueStatus = "behind"
        return
      }
      state.queueStatus = "up_to_date"
      state.moves.push(move)
      if (move.counting) {
        state.gameState.counting = true
        state.baseBoard = move.board
        state.gameState.board = rehydrate(move.board)
        return
      }
      let updated = updateBoard(get().baseBoard, move)
      state.baseBoard = updated
      state.gameState.board = rehydrate(updated)
      state.gameState.currentColor = get().gameState.currentColor ^ (BLACK | WHITE)
      state.gameState.currentPlayer = get().gameState.currentPlayer === get().black.name ? get().white.name : get().black.name
      state.gameState.forbidden = move.forbidden
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
      state.gameState.currentPlayer = game.currentPlayer
      state.gameState.currentColor = game.currentColor
      state.gameState.counting = game.counting
      state.gameState.forbidden = game.forbidden
      state.queueStatue = "up_to_date"
    }))
  },
}))
