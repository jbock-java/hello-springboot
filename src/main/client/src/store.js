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
    position: [
      "", "", "",
      "", "", "",
      "", "", "",
    ],
    lastMove: undefined, // id of player who made the most recent move
  },
  setInit: (payload, auth) => {
    set(produce(state => {
      state.status = payload.status
      state.gameState.lastMove = payload.id
      state.symbol = payload.id !== auth.id? "circle" : "cross"
    }))
  },
  setGameState: (payload) => {
    set(produce(state => {
      state.gameState.position = payload.position
      state.gameState.lastMove = payload.id
    }))
  },
}))
