import {
  PointQueue,
} from "./PointQueue.js"
import {
  PointSet,
} from "./PointSet.js"
import {
  hasStone,
  resurrect,
  BLACK,
  WHITE,
  COLORS,
  TERRITORY_B,
  TERRITORY_W,
  TERRITORY,
  REMOVED_B,
  REMOVED_W,
  TOGGLE_B,
  TOGGLE_W,
  TOGGLE_STUFF,
} from "src/util.js"

export function count(board) {
  let acc = createAcc(board.length)
  for (let y = 0; y < board.length; y++) {
    let row = board[y]
    for (let x = 0; x < row.length; x++) {
      if (acc[y][x] === -1) {
        colorEmptyTerritory(board, acc, x, y)
      }
    }
  }
  return acc
}

function recurToggleStonesAt(board, x, y, color, pointsChecked, pointsToCheck) {
  let dim = board.length
  if (Math.min(x, y) < 0 || Math.max(x, y) >= dim) {
    return
  }
  let c = board[y][x]
  if (c !== color) {
    return
  }
  if (pointsChecked.has(x, y)) {
    return
  }
  pointsChecked.add(x, y)
  pointsToCheck.offer(x, y)
}

export function toggleStonesAt(board, xx, yy) {
  let color = board[yy][xx]
  if (!(color & TOGGLE_STUFF)) {
    return board
  }
  let dim = board.length
  let pointsToCheck = new PointQueue(dim)
  let pointsChecked = new PointSet(dim)
  pointsChecked.add(xx, yy)
  pointsToCheck.offer(xx, yy)
  let updated = board.slice()
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.trunc(ptId / dim)
    let x = ptId % dim
    if (updated[y] === board[y]) {
      updated[y] = board[y].slice()
    }
    updated[y][x] = toggleRemoved(board[y][x])
    recurToggleStonesAt(board, x, y - 1, color, pointsChecked, pointsToCheck)
    recurToggleStonesAt(board, x, y + 1, color, pointsChecked, pointsToCheck)
    recurToggleStonesAt(board, x - 1, y, color, pointsChecked, pointsToCheck)
    recurToggleStonesAt(board, x + 1, y, color, pointsChecked, pointsToCheck)
  }
  return updated
}

export function resetCounting(board) {
  let dim = board.length
  let updated = board.slice()
  for (let y = 0; y < dim; y++) {
    updated[y] = board[y].slice()
    for (let x = 0; x < dim; x++) {
      updated[y][x] = resurrect(board[y][x]) & COLORS
    }
  }
  return updated
}

function recurFindColor(dim, x, y, pointsChecked, pointsToCheck) {
  if (Math.min(x, y) < 0 || Math.max(x, y) >= dim) {
    return
  }
  if (pointsChecked.has(x, y)) {
    return
  }
  pointsChecked.add(x, y)
  pointsToCheck.offer(x, y)
}

function findColor(board, xx, yy) {
  if (hasStone(board[yy][xx])) {
    return board[yy][xx]
  }
  let dim = board.length
  let pointsChecked = new PointSet(dim)
  let color = -1
  pointsChecked.add(xx, yy)
  let pointsToCheck = new PointQueue(dim)
  pointsToCheck.offer(xx, yy)
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.trunc(ptId / dim)
    let x = ptId % dim
    if (hasStone(board[y][x])) {
      if (color === -1 || color === board[y][x]) {
        color = board[y][x]
      } else {
        return 0 // disputed area
      }
    } else {
      recurFindColor(dim, x, y - 1, pointsChecked, pointsToCheck)
      recurFindColor(dim, x, y + 1, pointsChecked, pointsToCheck)
      recurFindColor(dim, x - 1, y, pointsChecked, pointsToCheck)
      recurFindColor(dim, x + 1, y, pointsChecked, pointsToCheck)
    }
  }
  return color
}

function recurColorEmptyTerritory(board, x, y, found, acc, pointsToCheck) {
  let dim = board.length
  if (Math.min(x, y) < 0 || Math.max(x, y) >= dim) {
    return
  }
  if (acc[y][x] !== -1) {
    return
  }
  let color = board[y][x]
  if (!isEmpty(color)) {
    return
  }
  acc[y][x] = found ? getTerritoryMarker(found, color) : (color & ~TERRITORY)
  pointsToCheck.offer(x, y)
}

function colorEmptyTerritory(board, acc, xx, yy) {
  if (hasStone(board[yy][xx])) {
    acc[yy][xx] = board[yy][xx]
    return
  }
  let found = findColor(board, xx, yy)
  if (found === -1) { // empty board
    for (let row of acc) {
      row.fill(0)
    }
    return
  }
  let dim = board.length
  let pointsToCheck = new PointQueue(dim)
  acc[yy][xx] = found ? getTerritoryMarker(found, board[yy][xx]) : (board[yy][xx] & ~TERRITORY)
  pointsToCheck.offer(xx, yy)
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.trunc(ptId / dim)
    let x = ptId % dim
    recurColorEmptyTerritory(board, x, y - 1, found, acc, pointsToCheck)
    recurColorEmptyTerritory(board, x, y + 1, found, acc, pointsToCheck)
    recurColorEmptyTerritory(board, x - 1, y, found, acc, pointsToCheck)
    recurColorEmptyTerritory(board, x + 1, y, found, acc, pointsToCheck)
  }
}

function getTerritoryMarker(found, empty) {
  if ((empty & asRemoved(found)) !== 0) {
    return found // resurrect
  }
  return asTerritory(found) | (empty & ~TERRITORY)
}

function asTerritory(color) {
  if (color === BLACK) {
    return TERRITORY_B
  }
  if (color === WHITE) {
    return TERRITORY_W
  }
  return color
}

function asRemoved(color) {
  if (color === BLACK) {
    return REMOVED_B
  }
  if (color === WHITE) {
    return REMOVED_W
  }
  return color
}

function toggleRemoved(color) {
  if (color & TOGGLE_B) {
    return color ^ TOGGLE_B
  }
  if (color & TOGGLE_W) {
    return color ^ TOGGLE_W
  }
  return color
}

function createAcc(dim) {
  let result = Array(dim)
  for (let y = 0; y < dim; y++) {
    result[y] = new Int32Array(dim).fill(-1)
  }
  return result
}

function isEmpty(color) {
  return (color & COLORS) === 0
}
