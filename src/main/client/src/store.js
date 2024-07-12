import {
  create,
} from "zustand"
import {
  produce,
} from "immer"

export const useGameStore = create(set => ({
  symbol: "", // my symbol
  id: 0, // my id
  status: "waiting",
  gameState: {
    position: [
      "", "", "",
      "", "", "",
      "", "", "",
    ],
    lastMove: 0, // id of player who made the most recent move
  },
  setInit: (payload) => {
    set(produce(state => {
      state.status = payload.status
      state.gameState.lastMove = payload.id
    }))
  },
  setId: (id) => {
    set(produce(state => {
      state.symbol = id % 2 === 0 ? "circle" : "cross"
      state.id = id
    }))
  },
  setGameState: (payload) => {
    set(produce(state => {
      state.gameState.position = payload.position
      state.gameState.lastMove = payload.id
    }))
  },
}))
