import {
  PointQueue,
} from "./PointQueue.js"
import {
  PointList,
} from "./PointList.js"
import {
  PointSet,
} from "./PointSet.js"
import {
  BLACK,
  WHITE,
} from "../util.js"

export function updateBoard(board, move) {
  let {pass, x, y, color} = move
  if (pass) {
    return [PointList.empty(), board]
  }
  board = applyMove(board, move)
  let oppositeColor = color ^ (WHITE | BLACK)
  let dead = new PointList(board.length)
  dead.addAll(findDeadStones(board, x, y - 1, oppositeColor))
  dead.addAll(findDeadStones(board, x, y + 1, oppositeColor))
  dead.addAll(findDeadStones(board, x - 1, y, oppositeColor))
  dead.addAll(findDeadStones(board, x + 1, y, oppositeColor))
  if (dead.isEmpty()) {
    return [PointList.empty(), board]
  }
  let updated = board.slice()
  dead.forEach((x, y) => {
    if (updated[y] === board[y]) {
      updated[y] = board[y].slice()
    }
    updated[y][x] = 0
  })
  return [dead, updated]
}

function findDeadStones(board, xx, yy, color) {
  let dim = board.length
  if (Math.min(xx, yy) < 0 || Math.max(xx, yy) >= dim) {
    return undefined
  }
  if (board[yy][xx] !== color) {
    return undefined
  }
  if (yy > 0 && board[yy - 1][xx] == 0) {
    return undefined
  }
  if (yy < dim - 1 && board[yy + 1][xx] == 0) {
    return undefined
  }
  if (xx > 0 && board[yy][xx - 1] == 0) {
    return undefined
  }
  if (xx < dim - 1 && board[yy][xx + 1] == 0) {
    return undefined
  }
  let acc = new PointList(dim)
  let pointsChecked = new PointSet(dim)
  pointsChecked.add(xx, yy)
  let pointsToCheck = new PointQueue(dim)
  pointsToCheck.offer(xx, yy)
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.trunc(ptId / dim)
    let x = ptId % dim
    acc.add(x, y)
    if (y > 0) {
      let bpt = board[y - 1][x]
      if (bpt === 0) {
        return undefined
      } else if (bpt === color && !pointsChecked.has(x, y - 1)) {
        pointsChecked.add(x, y - 1)
        pointsToCheck.offer(x, y - 1)
      }
    }
    if (y < dim - 1) {
      let bpt = board[y + 1][x]
      if (bpt === 0) {
        return undefined
      } else if (bpt === color && !pointsChecked.has(x, y + 1)) {
        pointsChecked.add(x, y + 1)
        pointsToCheck.offer(x, y + 1)
      }
    }
    if (x > 0) {
      let bpt = board[y][x - 1]
      if (bpt === 0) {
        return undefined
      } else if (bpt === color && !pointsChecked.has(x - 1, y)) {
        pointsChecked.add(x - 1, y)
        pointsToCheck.offer(x - 1, y)
      }
    }
    if (x < dim - 1) {
      let bpt = board[y][x + 1]
      if (bpt === 0) {
        return undefined
      } else if (bpt === color && !pointsChecked.has(x + 1, y)) {
        pointsChecked.add(x + 1, y)
        pointsToCheck.offer(x + 1, y)
      }
    }
  }
  return acc
}

function applyMove(board, {color, x, y}) {
  let result = board.slice()
  result[y] = board[y].slice()
  result[y][x] = color
  return result
}
