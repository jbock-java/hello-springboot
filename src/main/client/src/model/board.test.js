import {
  expect,
  test,
} from "vitest"
import {
  getGroupInfo,
  rehydrate,
} from "./board.js"
import {
  BLACK,
  WHITE,
} from "src/util.js"

test("liberties", () => {
  let b = BLACK
  let w = WHITE
  let board = [
    [0, b, w, 0], 
    [b, b, w, 0], 
    [w, w, w, 0], 
    [0, 0, 0, 0], 
  ]
  let result = rehydrate(board)
  expect(result[0][1].liberties).toBe(1)
})

test("has", () => {
  let b = BLACK
  let w = WHITE
  let board = [
    [0, b, w, 0],
    [b, b, w, 0],
    [w, w, w, 0],
    [0, 0, 0, 0],
  ]
  let { has } = getGroupInfo(board, 0, 1)
  expect(has(0, 0)).toBe(false)
  expect(has(0, 1)).toBe(true)
  expect(has(1, 0)).toBe(true)
  expect(has(1, 1)).toBe(true)
  expect(has(2, 0)).toBe(false)
  expect(has(2, 1)).toBe(false)
  expect(has(2, 2)).toBe(false)
  expect(has(1, 2)).toBe(false)
  expect(has(0, 2)).toBe(false)
})
