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

export const useGameStore = create((set, get) => ({
  symbol: 0,
  black: {
    name: "",
  },
  white: {
    name: "",
  },
  gameState: {
    currentPlayer: undefined,
    counting: false,
  },
  setGameState: (game, auth) => {
    set(produce(state => {
      let oldState = get()
      if (oldState.black.name !== game.black.name) {
        state.black = game.black
      }
      if (oldState.white.name !== game.white.name) {
        state.white = game.white
      }
      state.gameState.board = game.board
      state.gameState.currentPlayer = game.currentPlayer
      state.gameState.counting = game.counting
      let symbol = game.black.name === auth.name? BLACK : WHITE 
      if (oldState.symbol !== symbol) {
        state.symbol = symbol
      }
    }))
  },
}))
