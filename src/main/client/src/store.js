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
  },
  setAuth: (payload) => {
    set(produce(state => {
      state.auth.name = payload.name
      state.auth.id = payload.id
    }))
  },
}))

export const useGameStore = create((set) => ({
  symbol: "", // my symbol
  gameState: {
    black: {
      id: undefined,
      name: "",
    },
    white: {
      id: undefined,
      name: "",
    },
    position: [
      "", "", "",
      "", "", "",
      "", "", "",
    ],
    currentUser: undefined,
  },
  setInit: (payload, auth) => {
    set(produce(state => {
      state.gameState.black = payload.black
      state.gameState.white = payload.white
      state.gameState.position = payload.position
      state.gameState.currentUser = payload.currentUser
      state.symbol = payload.black.id === auth.id? "circle" : "cross"
    }))
  },
  setGameState: (payload) => {
    set(produce(state => {
      state.gameState.position = payload.position
      state.gameState.currentUser = payload.currentUser
    }))
  },
}))
