import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  BLACK,
} from "./util.js"
import {
  createBoardWithGroups,
} from "./model/board.js"

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

export const useGameStore = create((set) => ({
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
  },
  setGameState: (game) => {
    set(produce(state => {
      state.black = game.black
      state.white = game.white
      state.editMode = game.editMode
      state.gameState.board = createBoardWithGroups(game.board)
      state.gameState.currentPlayer = game.currentPlayer
      state.gameState.currentColor = game.currentColor
      state.gameState.counting = game.counting
    }))
  },
}))
