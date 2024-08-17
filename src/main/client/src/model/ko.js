import {
  updateBoard,
} from "./base.js"
import {
  BLACK,
  WHITE,
} from "src/util.js"

const NOT_FORBIDDEN = [-1, -1]

export function getForbidden(board, updated, move) {
  if (!board || !board.length) {
    return NOT_FORBIDDEN
  }
  let {x, y, color, dead} = move
  if (dead.size() !== 1) {
    return NOT_FORBIDDEN
  }
  let oppositeColor = color ^ (WHITE | BLACK)
  let dx = dead.x(0)
  let dy = dead.y(0)
  let [kill] = updateBoard(updated, {x: dx, y: dy, color: oppositeColor})
  if (kill.size() !== 1) {
    return NOT_FORBIDDEN
  }
  if (kill.x(0) !== x || kill.y(0) !== y) {
    return NOT_FORBIDDEN
  }
  return [dx, dy]
}
