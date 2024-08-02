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
  hasStone,
  BLACK,
  WHITE,
} from "../util.js"

export function getGroup(board, xx, yy) {
  let color = board[yy][xx]
  let dim = board.length
  if (!hasStone(color)) {
    return {
      x: xx,
      y: yy,
      ptId: yy * dim + xx,
      color: color,
      hasStone: false,
      liberties: 0,
      has: (x, y) => x === xx && y === yy,
      points: {
        forEach: (consumer) => consumer(xx, yy),
      },
    }
  }
  let pointsChecked = new PointSet(dim)
  let points = new PointList(dim)
  let pointsToCheck = new PointQueue(dim)
  let liberties = 0
  pointsToCheck.offer(xx, yy)
  pointsChecked.add(xx, yy)
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.trunc(ptId / dim)
    let x = ptId % dim
    points.add(x, y)
    if (y > 0 && !pointsChecked.has(x, y - 1)) {
      pointsChecked.add(x, y - 1)
      let bpt = board[y - 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color) {
        pointsToCheck.offer(x, y - 1)
      }
    }
    if (y < dim - 1 && !pointsChecked.has(x, y + 1)) {
      pointsChecked.add(x, y + 1)
      let bpt = board[y + 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color) {
        pointsToCheck.offer(x, y + 1)
      }
    }
    if (x > 0 && !pointsChecked.has(x - 1, y)) {
      pointsChecked.add(x - 1, y)
      let bpt = board[y][x - 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color) {
        pointsToCheck.offer(x - 1, y)
      }
    }
    if (x < dim - 1 && !pointsChecked.has(x + 1, y)) {
      pointsChecked.add(x + 1, y)
      let bpt = board[y][x + 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color) {
        pointsToCheck.offer(x + 1, y)
      }
    }
  }
  let set = points.toSet()
  return {
    x: xx,
    y: yy,
    ptId: yy * dim + xx,
    color: color,
    hasStone: true,
    liberties: liberties,
    has: (x, y) => set.has(x, y),
    points: points,
  }
}

export function rehydrate(board) {
  let dim = board.length
  let result = []
  for (let i = 0; i < board.length; i++) {
    result.push([])
  }
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (result[y][x]) {
        result[y][x] = {...result[y][x], x: x, y: y, ptId: y * dim + x }
        continue
      }
      let group = getGroup(board, x, y)
      group.points.forEach((_x, _y) => {
        result[_y][_x] = group
      })
    }
  }
  return result
}

export function isForbidden(board, groupInfo, currentColor) {
  let { x, y } = groupInfo
  let dim = board.length
  if (board[y][x].hasStone) {
    return true
  }
  if (y > 0) {
    let {color, liberties, hasStone} = board[y - 1][x]
    if (!hasStone) {
      return false
    }
    if (color !== currentColor && liberties === 1) {
      return false
    }
    if (color === currentColor && liberties >= 2) {
      return false
    }
  }
  if (y < dim - 1) {
    let {color, liberties, hasStone} = board[y + 1][x]
    if (!hasStone) {
      return false
    }
    if (color !== currentColor && liberties === 1) {
      return false
    }
    if (color === currentColor && liberties >= 2) {
      return false
    }
  }
  if (x > 0) {
    let {color, liberties, hasStone} = board[y][x - 1]
    if (!hasStone) {
      return false
    }
    if (color !== currentColor && liberties === 1) {
      return false
    }
    if (color === currentColor && liberties >= 2) {
      return false
    }
  }
  if (x < dim - 1) {
    let {color, liberties, hasStone} = board[y][x + 1]
    if (!hasStone) {
      return false
    }
    if (color !== currentColor && liberties === 1) {
      return false
    }
    if (color === currentColor && liberties >= 2) {
      return false
    }
  }
  return true
}

export function updateBoard(board, move) {
  let {pass, x, y, color} = move
  if (pass) {
    return board
  }
  board = applyMove(board, move)
  let oppositeColor = color ^ (WHITE | BLACK)
  board = removeDeadGroup(board, x, y - 1, oppositeColor)
  board = removeDeadGroup(board, x, y + 1, oppositeColor)
  board = removeDeadGroup(board, x - 1, y, oppositeColor)
  board = removeDeadGroup(board, x + 1, y, oppositeColor)
  return board
}

function removeDeadGroup(board, xx, yy, color) {
  let dim = board.length
  if (Math.min(xx, yy) < 0 || Math.max(xx, yy) >= dim) {
    return board
  }
  if (board[yy][xx] !== color) {
    return board
  }
  if (yy > 0 && board[yy - 1][xx] == 0) {
    return board
  }
  if (yy < dim - 1 && board[yy + 1][xx] == 0) {
    return board
  }
  if (xx > 0 && board[yy][xx - 1] == 0) {
    return board
  }
  if (xx < dim - 1 && board[yy][xx + 1] == 0) {
    return board
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
        return board
      } else if (bpt === color && !pointsChecked.has(x, y - 1)) {
        pointsChecked.add(x, y - 1)
        pointsToCheck.offer(x, y - 1)
      }
    }
    if (y < dim - 1) {
      let bpt = board[y + 1][x]
      if (bpt === 0) {
        return board
      } else if (bpt === color && !pointsChecked.has(x, y + 1)) {
        pointsChecked.add(x, y + 1)
        pointsToCheck.offer(x, y + 1)
      }
    }
    if (x > 0) {
      let bpt = board[y][x - 1]
      if (bpt === 0) {
        return board
      } else if (bpt === color && !pointsChecked.has(x - 1, y)) {
        pointsChecked.add(x - 1, y)
        pointsToCheck.offer(x - 1, y)
      }
    }
    if (x < dim - 1) {
      let bpt = board[y][x + 1]
      if (bpt === 0) {
        return board
      } else if (bpt === color && !pointsChecked.has(x + 1, y)) {
        pointsChecked.add(x + 1, y)
        pointsToCheck.offer(x + 1, y)
      }
    }
  }
  let result = board.slice()
  acc.forEach((x, y) => {
    if (result[y] === board[y]) {
      result[y] = board[y].slice()
    }
    result[y][x] = 0
  })
  return result
}

function applyMove(board, {color, x, y}) {
  let result = board.slice()
  result[y] = board[y].slice()
  result[y][x] = color
  return result
}
