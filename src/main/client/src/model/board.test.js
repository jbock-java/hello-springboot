import {
  expect,
  test,
} from "vitest"
import {
  createBoardWithGroups,
} from "./board.js"
import {
  BLACK,
  WHITE,
} from "../util.js"


test("liberties", () => {
  let b = BLACK
  let w = WHITE
  let board = [
    [0, b, w, 0], 
    [b, b, w, 0], 
    [w, w, w, 0], 
    [0, 0, 0, 0], 
  ]
  let result = createBoardWithGroups(board)
  expect(result[0][1].liberties).toBe(1)
})
