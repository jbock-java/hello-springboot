import {
  produce,
} from "immer"

export function initialState() {
  return {
    stack: [], // newgame, accept
    openGameId: "",
  }
}

export function setOpenGameId(state, openGameId) {
  return produce(state, draft => {
    draft.openGameId = openGameId
  })
}

function setOpen(state, el, kind, data) {
  if (!el) {
    return state
  }
  if (state.stack.some(obj => obj.kind === kind)) {
    return state
  }
  return produce(state, draft => {
    draft.stack = [...state.stack, {
      kind: kind,
      el: el,
      data: data,
    }]
  })
}

export function getZindex({stack}, kind) {
  for (let i = 0; i < stack.length; i++) {
    if (stack[i].kind === kind) {
      return 5 + i
    }
  }
  return 0
}

export function setNewGameOpen(state, el) {
  return setOpen(state, el, "newgame")
}

export function getAcceptData({stack}) {
  for (let i = 0; i < stack.length; i++) {
    if (stack[i].kind === "accept") {
      return stack[i].data
    }
  }
  return undefined
}

export function setAcceptDialogOpen(state, el, data) {
  return setOpen(state, el, "accept", data)
}

export function closeLobbyPopup(state) {
  if (!state.stack.length) {
    return state
  }
  let newStack = [...state.stack]
  newStack.pop()
  return produce(state, draft => {
    draft.stack = newStack
  })
}

export function handleLobbyClick(state, event) {
  if (!state.stack.length) {
    return state
  }
  let {clientX, clientY} = event
  let {el} = state.stack[state.stack.length - 1]
  let {left, right, top, bottom} = el.getBoundingClientRect()
  if (clientX <= right && clientX >= left && clientY <= bottom && clientY >= top) {
    return state
  }
  let newStack = [...state.stack]
  newStack.pop()
  return produce(state, draft => {
    draft.stack = newStack
  })
}
