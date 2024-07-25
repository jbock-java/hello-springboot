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

function getGroup(board, xx, yy) {
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
    let y = Math.floor(ptId / dim)
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
  return {
    x: xx,
    y: yy,
    ptId: yy * dim + xx,
    color: color,
    hasStone: true,
    liberties: liberties,
    has: pointsChecked.has,
    points: points,
  }
}

export function createBoardWithGroups(board) {
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
    return false 
  }
  if (y > 0) {
    let { color, liberties, hasStone } = board[y - 1][x]
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
    let { color, liberties, hasStone } = board[y + 1][x]
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
    let { color, liberties, hasStone } = board[y][x - 1]
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
    let { color, liberties, hasStone } = board[y][x + 1]
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
