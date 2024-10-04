export function initialState() {
  return {
    stack: [],
  }
}

function setOpen(state, el, kind, data) {
  if (!el) {
    return state
  }
  if (state.stack.some(obj => obj.kind === kind)) {
    return state
  }
  return {
    stack: [...state.stack, {
      kind: kind,
      el: el,
      data: data,
    }],
  }
}

export function checkNewGameOpen({stack}) {
  return stack.some(obj => obj.kind === "newgame")
}

export function setNewGameOpen(state, el) {
  return setOpen(state, el, "newgame")
}

export function getAcceptDialog({stack}) {
  let result = stack.filter(obj => obj.kind === "accept")
  if (!result.length) {
    return undefined
  }
  return result[0]
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
  return {
    stack: newStack,
  }
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
  return {
    stack: newStack,
  }
}
