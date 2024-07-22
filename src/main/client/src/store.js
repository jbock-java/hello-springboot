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
  symbol: 0,
  editMode: false,
  black: {
    name: "",
  },
  white: {
    name: "",
  },
  gameState: {
    currentPlayer: undefined,
    currentColor: BLACK,
    counting: false,
  },
  setGameState: (game, auth) => {
    set(produce(state => {
      state.black = game.black
      state.white = game.white
      state.editMode = game.editMode
      state.gameState.board = game.board
      state.gameState.currentPlayer = game.currentPlayer
      state.gameState.currentColor = game.currentColor
      state.gameState.counting = game.counting
      let symbol = game.black.name === auth.name? BLACK : WHITE 
      state.symbol = symbol
    }))
  },
}))
