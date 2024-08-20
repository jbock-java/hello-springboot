import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  persist,
} from "zustand/middleware"

export const useAuthStore = create(
  persist(
    (set) => ({
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
    }),
    { name: "auth-storage" },
  ),
)

export const useMuteStore = create(
  persist(
    (set, get) => ({
      muted: false,
      toggleMuted: () =>
        set(() => ({
          muted: !get().muted
        }))
    }),
    { name: "mute-storage" },
  )
)

// trick to re-render chat after each move
export const useGameTicker = create((set, get) => ({
  gameTicker: false,
  toggleGameTicker: () =>
    set(() => ({
      gameTicker: !get().gameTicker
    }))
  }),
)
