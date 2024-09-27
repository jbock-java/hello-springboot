import {
  produce,
} from "immer"
import {
  BLACK,
  WHITE,
  COLORS,
  hasStone,
  resurrect,
} from "src/util.js"
import {
  rehydrate,
} from "src/model/board.js"
import {
  updateBoard,
} from "src/model/base.js"
import {
  getForbidden,
} from "src/model/ko.js"
import {
  count,
  toggleStonesAt,
  resetCounting,
} from "src/model/count.js"
import {
  PointList,
} from "src/model/PointList.js"

const STATE_COUNTING = 1
const STATE_TIMEOUT = 2

export function initialState() {
  return {
    id: "",
    moves: [],
    baseBoard: [],
    historyBoard: [],
    viewPos: Number.NaN,
    dim: 0,
    timesetting: 0,
    handicap: 0,
    queueStatus: "behind",
    black: "",
    white: "",
    myColor: 0,
    state: 0,
    queueLength: 0,
    lastMove: undefined,
    board: [],
    forbidden: [-1, -1],
  }
}

export function countingComplete({dim, state, baseBoard}) {
  if (state !== STATE_COUNTING) {
    return false
  }
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      if (!baseBoard[y][x]) {
        return false
      }
    }
  }
  return true
}

export function currentPlayer({moves, white, black, handicap}) {
  if (handicap > moves.length) {
    return black
  }
  if (!moves.length) {
    return black
  }
  return moves[moves.length - 1].color === BLACK ? white : black
}

export function isSelfPlay({black, white}) {
  return black === white
}

export function isKibitz({black, white}, auth) {
  return black !== auth.name && white !== auth.name
}

export function currentColor({moves, handicap}) {
  if (handicap > moves.length) {
    return BLACK
  }
  if (!moves.length) {
    return BLACK
  }
  return moves[moves.length - 1].color ^ COLORS
}

export function countingAgreed({moves, myColor}) {
  if (!moves.length) {
    return false
  }
  let move = moves[moves.length - 1]
  return move.color === myColor && move.action === "agreeCounting"
}

export function gameHasEnded({state, moves}) {
  if (state === STATE_TIMEOUT) {
    return true
  }
  if (!moves.length) {
    return false
  }
  let move = moves[moves.length - 1]
  return move.action === "end"
}

export function isReviewing(baseState) {
  return baseState.viewPos < baseState.queueLength
}

export function isAtStart(gameState) {
  return !gameState.viewPos
}

export function isAtEnd(gameState) {
  return gameState.viewPos >= gameState.queueLength
}

export function teleport(baseState, targetPos) {
  let viewPos = baseState.viewPos
  if (targetPos >= baseState.queueLength) {
    return goToEnd(baseState)
  }
  let diff = targetPos - viewPos
  let direction = Math.sign(diff)
  let moves = baseState.moves
  let baseBoard = baseState.baseBoard
  let action = diff < 0 ? unApply : updateBoard
  for (let i = 0; i < Math.abs(diff); i++) {
    let [, updated] = action(baseBoard, diff < 0 ? moves[viewPos - 1] : moves[viewPos])
    baseBoard = updated
    viewPos += direction
  }
  let historyBoard = baseState.historyBoard
  return produce(baseState, (draft) => {
    draft.baseBoard = baseBoard
    draft.board = cheapRehydrate(baseBoard, historyBoard)
    draft.viewPos = viewPos
    if (viewPos) {
      let previous = moves[viewPos - 1]
      draft.lastMove = previous.action === "pass" ? undefined : previous
    } else {
      draft.lastMove = undefined
    }
  })
}

export function moveBack(baseState) {
  let viewPos = baseState.viewPos
  return teleport(baseState, viewPos - 1)
}

export function moveForward(baseState) {
  let viewPos = baseState.viewPos
  return teleport(baseState, viewPos + 1)
}

function goToEnd(baseState) {
  let moves = baseState.moves
  let queueLength = baseState.queueLength
  let baseBoard = baseState.baseBoard
  let historyBoard = baseState.historyBoard
  for (let i = baseState.viewPos; i < moves.length; i++) {
    let move = moves[i]
    let previousMove = getMove(moves, i - 1)
    let [, updated] = updateBoardState(baseBoard, previousMove, move, !baseState.winnerByTime)
    baseBoard = updated
  }
  let board = rehydrate(baseBoard, historyBoard)
  return produce(baseState, (draft) => {
    draft.board = board
    draft.viewPos = queueLength
    draft.lastMove = getMove(moves, queueLength - 1)
  })
}

export function addMove(baseState, move) {
  let {action, n} = move
  let {moves, baseBoard, historyBoard, state, queueLength} = baseState
  let counting = state === STATE_COUNTING
  let previousMove = getMove(moves, n - 1)
  if (n < moves.length) {
    return baseState
  }
  if (moves.length < n) {
    return produce(baseState, (draft) => {
      draft.queueStatus = "behind"
    })
  }
  if (action === "end") {
    return produce(baseState, (draft) => {
      draft.moves.push(move)
    })
  }
  let [storedMove, updated, forbidden] = updateBoardState(baseBoard, previousMove, move, counting)
  return produce(baseState, (draft) => {
    draft.queueStatus = "up_to_date"
    if (!counting) {
      draft.queueLength = queueLength + 1
      draft.viewPos = queueLength + 1
    }
    draft.moves.push(storedMove)
    draft.lastMove = action === "pass" ? undefined : storedMove
    draft.baseBoard = updated
    let updatedFinalBoard = counting ? historyBoard : updateHistoryBoard(historyBoard, move)
    draft.historyBoard = updatedFinalBoard
    draft.board = rehydrate(updated, updatedFinalBoard)
    draft.forbidden = forbidden
    if (action === "pass" && previousMove?.action === "pass") {
      draft.state = STATE_COUNTING
    }
  })
}

export function createGameState(game, auth) {
  let baseBoard = Array(game.dim)
  let historyBoard = Array(game.dim)
  for (let y = 0; y < game.dim; y++) {
    baseBoard[y] = new Int32Array(game.dim)
    historyBoard[y] = []
    for (let x = 0; x < game.dim; x++) {
      historyBoard[y][x] = {
        n: -1,
        color: 0,
      }
    }
  }
  let moves = []
  let forbidden = [-1, -1]
  let passes = 0
  let counting = false
  let queueLength = 0
  for (let i = 0; i < game.moves.length; i++) {
    let move = game.moves[i]
    if (move.action === "end") {
      moves.push(move)
      break
    }
    if (move.action === "pass") {
      if (passes) {
        counting = true
        queueLength = move.n
      }
      passes = 1
    } else {
      passes = 0
    }
    let previousMove = getMove(moves, i - 1)
    let [storedMove, updated, newForbidden] = updateBoardState(baseBoard, previousMove, move, counting)
    if (!counting && !move.action && move.color) {
      historyBoard[move.y][move.x] = {
        n: move.n,
        color: move.color,
      }
    }
    moves.push(storedMove)
    forbidden = newForbidden
    baseBoard = updated
  }
  let result = {
    id: game.id,
    black: game.black,
    white: game.white,
    dim: game.dim,
    timesetting: game.timesetting,
    handicap: game.handicap,
    state: game.state,
    baseBoard: baseBoard,
    historyBoard: historyBoard,
    moves: moves,
    board: rehydrate(baseBoard, historyBoard),
    forbidden: forbidden,
    viewPos: queueLength || moves.length,
    queueLength: queueLength || moves.length,
    queueStatus: "up_to_date",
  }
  if (auth.name === game.black) {
    result.myColor = BLACK
  } else if (auth.name === game.white) {
    result.myColor = WHITE
  } else {
    result.myColor = 0
  }
  if (moves.length) {
    let lastMove = moves[moves.length - 1]
    if (lastMove.action !== "pass") {
      result.lastMove = lastMove
    }
  }
  return result
}

function updateBoardState(baseBoard, previousMove, move, counting) {
  if (move.action === "end") {
    return [move, baseBoard, [-1, -1]]
  }
  if (move.action === "agreeCounting") {
    return [move, baseBoard, [-1, -1]]
  }
  if (move.action === "pass" && previousMove?.action === "pass") {
    return [move, count(baseBoard), [-1, -1]]
  }
  if (counting) {
    let updated = move.action === "resetCounting" ?
      resetCounting(baseBoard) :
      toggleStonesAt(baseBoard, move.x, move.y)
    return [move, count(updated), [-1, -1]]
  }
  let [dead, updated] = updateBoard(baseBoard, move)
  let storedMove = {...move, dead: dead}
  let forbidden = getForbidden(baseBoard, updated, storedMove)
  return [storedMove, updated, forbidden]
}

function unApply(board, move) {
  let dim = board.length
  let result = Array(dim)
  for (let i = 0; i < board.length; i++) {
    result[i] = Array(dim)
  }
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (move.action !== "pass" && move.x === x && move.y === y) {
        result[y][x] = 0
      } else {
        result[y][x] = (resurrect(board[y][x]) & COLORS)
      }
    }
  }
  if (move.dead) {
    move.dead.forEach((x, y) => {
      result[y][x] = (move.color ^ COLORS)
    })
  }
  return [1, result]
}

function cheapRehydrate(baseBoard, historyBoard) {
  let dim = baseBoard.length
  let result = Array(dim)
  for (let i = 0; i < baseBoard.length; i++) {
    result[i] = Array(dim)
  }
  for (let y = 0; y < baseBoard.length; y++) {
    for (let x = 0; x < baseBoard[y].length; x++) {
      result[y][x] = {
        historyEntry: historyBoard[y][x],
        x: x,
        y: y,
        color: baseBoard[y][x],
        hasStone: hasStone(baseBoard[y][x]),
        isForbidden: () => false,
        liberties: 0,
        has: () => false,
        points: PointList.empty(),
      }
    }
  }
  return result
}

function getMove(moves, i) {
  if (i < 0) {
    return undefined
  }
  if (i >= moves.length) {
    return undefined
  }
  return moves[i]
}

function updateHistoryBoard(historyBoard, move) {
  let {x, y, n, color, action} = move
  if (action) {
    return historyBoard
  }
  if (!color) {
    return historyBoard
  }
  let updated = historyBoard.slice()
  updated[y] = historyBoard[y].slice()
  let oldColor = historyBoard[y][x].color
  updated[y][x] = {n, color: (color || oldColor)}
  return updated
}

export function isCounting({state}) {
  return state === STATE_COUNTING
}
