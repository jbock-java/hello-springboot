import {
  expect,
  test,
} from "vitest"
import {
  PointSet,
} from "./PointSet.js"

test("big", () => {
  let pointSet = new PointSet(19)
  pointSet.add(10, 10)
  expect(pointSet.has(9, 10)).toBe(false)
  expect(pointSet.has(10, 9)).toBe(false)
  expect(pointSet.has(10, 10)).toBe(true)
  expect(pointSet.has(10, 11)).toBe(false)
  expect(pointSet.has(10, 11)).toBe(false)
})
