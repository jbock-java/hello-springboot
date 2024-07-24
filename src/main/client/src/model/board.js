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
} from "./util.js"

function getGroup(board, xx, yy) {
  let color = board[yy][xx]
  if (!hasStone(color)) {
    return {
      color: color,
      liberties: 0,
      has: (x, y) => x === xx && y === yy,
      points: {
        forEach: (consumer) => consumer(xx, yy),
      },
    }
  }
  let dim = board.length
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
    if (y > 0) {
      let bpt = board[y - 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !pointsChecked.has(x, y - 1)) {
        pointsChecked.add(x, y - 1)
        pointsToCheck.offer(x, y - 1)
      }
    }
    if (y < dim - 1) {
      let bpt = board[y + 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !pointsChecked.has(x, y + 1)) {
        pointsChecked.add(x, y + 1)
        pointsToCheck.offer(x, y + 1)
      }
    }
    if (x > 0) {
      let bpt = board[y][x - 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !pointsChecked.has(x - 1, y)) {
        pointsChecked.add(x - 1, y)
        pointsToCheck.offer(x - 1, y)
      }
    }
    if (x < dim - 1) {
      let bpt = board[y][x + 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !pointsChecked.has(x + 1, y)) {
        pointsChecked.add(x + 1, y)
        pointsToCheck.offer(x + 1, y)
      }
    }
  }
  return {
    color: color,
    liberties: liberties,
    has: pointsChecked.has,
    points: points,
  }
}

export function createBoardWithGroups(board) {
  let result = []
  for (let i = 0; i < board.length; i++) {
    result.push([])
  }
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (result[y][x]) {
        continue
      }
      let group = getGroup(x, y)
      group.points.forEach((_x, _y) => {
        result[_y][_x] = group
      })
    }
  }
  return result
}
