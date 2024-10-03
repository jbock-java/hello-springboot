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

export const useTimeoutStore = create(set => ({
  timeout: 10,
  setTimeout: timeout => set(produce(draft => {
    draft.timeout = timeout
  }), true),
}))

export const useLobbyStore = create((set, get) => ({
  stack: [],
  isNewGameOpen: () => {
    return get().stack.some(obj => obj.kind === "newgame")
  },
  setOpen: (el, kind) => set(produce(draft => {
    if (!el) {
      return
    }
    if (get().stack.some(obj => obj.kind === kind)) {
      return
    }
    let rect = el.getBoundingClientRect()
    draft.stack = [...get().stack, {
      kind: kind,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      top: rect.top,
    }]
  }), true),
  setNewGameOpen: (el) => get().setOpen(el, "newgame"),
  isAcceptOpen: () => {
    return get().stack.some(obj => obj.kind === "accept")
  },
  setAcceptOpen: (el) => get().setOpen(el, "accept"),
  closeLobbyPopup: () => set(produce(draft => {
    if (!get().stack.length) {
      return
    }
    let newStack = [...get().stack]
    newStack.pop()
    draft.stack = newStack
  }), true),
  handleLobbyClick: (event) => set(produce(draft => {
    if (!get().stack.length) {
      return
    }
    let {clientX, clientY} = event
    let {left, right, top, bottom} = get().stack[get().stack.length - 1]
    if (clientX <= right && clientX >= left && clientY <= bottom && clientY >= top) {
      return
    }
    let newStack = [...get().stack]
    newStack.pop()
    draft.stack = newStack
  }), true),
}))
