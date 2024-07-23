import {
  expect,
  test,
} from "vitest"
import {
  PointList,
} from "./PointList.js"

test("grow", () => {
  let dim = 9
  let list = new PointList(dim)
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      list.add(x, y)
    }
  }
  let board = []
  for (let i = 0; i < dim; i++) {
    board[i] = []
  }
  list.forEach((x, y) => board[y][x] = y * dim + x)
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      expect(board[y][x]).toBe(y * dim + x)
    }
  }
})
