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
} from "../util.js"

export function getGroupInfo(board, xx, yy) {
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
      let groupInfo = getGroupInfo(board, x, y)
      groupInfo.points.forEach((_x, _y) => {
        result[_y][_x] = groupInfo
      })
    }
  }
  for (let y = 0; y < result.length; y++) {
    for (let x = 0; x < result[y].length; x++) {
      let groupInfo = result[y][x]
      groupInfo.isForbidden = (color) => isForbidden(result, groupInfo, color)
    }
  }
  return result
}

function isForbidden(board, {x, y}, currentColor) {
  if (board[y][x].hasStone) {
    return true
  }
  if (addsLiberty(board, x, y - 1, currentColor)) {
    return false
  }
  if (addsLiberty(board, x, y + 1, currentColor)) {
    return false
  }
  if (addsLiberty(board, x - 1, y, currentColor)) {
    return false
  }
  if (addsLiberty(board, x + 1, y, currentColor)) {
    return false
  }
  return true
}

function addsLiberty(board, x, y, currentColor) {
  let dim = board.length
  if (Math.min(x, y) < 0 || Math.max(x, y) >= dim) {
    return false
  }
  let {color, liberties, hasStone} = board[y][x]
  if (!hasStone) {
    return true
  }
  if (color !== currentColor && liberties === 1) {
    return true // can kill
  }
  if (color === currentColor && liberties >= 2) {
    return true
  }
  return false
}
