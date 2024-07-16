import {
  create,
} from "zustand"
import {
  produce,
} from "immer"

export const useAuthStore = create((set) => ({
  auth: {
    name: "",
    id: undefined,
    state: "anonymous",
  },
  setAuth: (payload) => {
    set(produce(state => {
      state.auth.name = payload.name
      state.auth.id = payload.name
      state.auth.state = "authenticated"
    }))
  },
  setPending: () => {
    set(produce(state => {
      state.auth.state = "pending"
    }), true)
  },
}))

export const useGameStore = create((set, get) => ({
  symbol: "", // my symbol
  black: {
    id: undefined,
    name: "",
  },
  white: {
    id: undefined,
    name: "",
  },
  gameState: {
    position: [
      "", "", "",
      "", "", "",
      "", "", "",
    ],
    currentUser: undefined,
  },
  setGameState: (game, auth) => {
    set(produce(state => {
      if (get().black.id !== game.black.id) {
        state.black = game.black
      }
      if (get().white.id !== game.white.id) {
        state.white = game.white
      }
      state.gameState.position = game.position
      state.gameState.currentUser = game.currentUser
      let symbol = game.black.id === auth.id? "circle" : "cross"
      if (get().symbol !== symbol) {
        state.symbol = symbol
      }
    }))
  },
}))
