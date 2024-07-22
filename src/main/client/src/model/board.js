import {
  PointQueue,
} from "./PointQueue.js"
import {
  PointSet,
} from "./PointSet.js"

export function getStoneGroup(board, xx, yy) {
  let dim = board.length
  let color = board[yy][xx]
  let acc = new PointSet(dim)
  let pointsToCheck = new PointQueue(dim)
  let liberties = 0
  pointsToCheck.offer(xx, yy)
  while (!pointsToCheck.isEmpty()) {
    let ptId = pointsToCheck.poll()
    let y = Math.floor(ptId / dim)
    let x = ptId % dim
    acc.add(x, y)
    if (y > 0) {
      let bpt = board[y - 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !acc.has(x, y - 1)) {
        acc.add(x, y - 1) 
        pointsToCheck.offer(x, y - 1)
      }
    }
    if (y < dim - 1) {
      let bpt = board[y + 1][x] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !acc.has(x, y + 1)) {
        acc.add(x, y + 1) 
        pointsToCheck.offer(x, y + 1)
      }
    }
    if (x > 0) {
      let bpt = board[y][x - 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !acc.has(x - 1, y)) {
        acc.add(x - 1, y) 
        pointsToCheck.offer(x - 1, y)
      }
    }
    if (x < dim - 1) {
      let bpt = board[y][x + 1] 
      if (bpt === 0) {
        liberties++
      } else if (bpt === color && !acc.has(x + 1, y)) {
        acc.add(x + 1, y) 
        pointsToCheck.offer(x + 1, y)
      }
    }
  }
  return {
    liberties: liberties,
    has: acc.has,
  }
}
