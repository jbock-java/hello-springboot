import {
  create,
} from "zustand"
import {
  produce,
} from "immer"

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
  symbol: "", // my symbol
  black: {
    name: "",
  },
  white: {
    name: "",
  },
  gameState: {
    currentUser: undefined,
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
      state.gameState.position = game.position
      state.gameState.currentUser = game.currentUser
      let symbol = game.black.name === auth.name? "w" : "b"
      if (oldState.symbol !== symbol) {
        state.symbol = symbol
      }
    }))
  },
}))
