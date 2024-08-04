import {
  expect,
  test,
} from "vitest"
import {
  count,
  toggleStonesAt,
  resetCounting,
} from "./count.js"
import {
  BLACK,
  WHITE,
  TERRITORY_B,
  TERRITORY_W,
  REMOVED_W,
  REMOVED_B,
} from "../util.js"

test("territoryChangeOwner", () => {
  let B = BLACK
  let t = TERRITORY_W
  let r = TERRITORY_W | REMOVED_B
  let v = TERRITORY_B
  let k = REMOVED_W
  let s = REMOVED_W | TERRITORY_B
  let position = [
      [t, r, k, 0, 0],
      [r, r, k, 0, 0],
      [k, k, k, B, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
  ]
  let counted = count(position)
  expect(counted).toEqual(mapInt([
      [v, B, s, v, v],
      [B, B, s, v, v],
      [s, s, s, B, v],
      [v, v, v, v, v],
      [v, v, v, v, v],
  ]))
})

test("toggle", () => {
  let B = BLACK
  let W = WHITE
  let t = TERRITORY_W
  let r = TERRITORY_W | REMOVED_B
  let k = REMOVED_W
  let position = [
      [t, r, W, 0, 0],
      [r, r, W, 0, 0],
      [W, W, W, B, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
  ]
  let toggled = toggleStonesAt(position, 0, 2)
  expect(toggled).toEqual([
      [t, r, k, 0, 0],
      [r, r, k, 0, 0],
      [k, k, k, B, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
  ])
})

test("reset", () => {
  let B = BLACK
  let W = WHITE
  let f = REMOVED_W | TERRITORY_B
  let t = TERRITORY_B
  let position = [
      [t, B, f, t, t],
      [B, B, f, t, t],
      [f, f, f, t, t],
      [t, t, t, t, t],
      [t, t, t, t, t],
  ]
  let result = resetCounting(position)
  expect(result).toEqual([
      [0, B, W, 0, 0],
      [B, B, W, 0, 0],
      [W, W, W, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
  ])
})

function mapInt(ar) {
  let result = Array(ar.length)
  for (let y = 0; y < ar.length; y++) {
    result[y] = new Int32Array(ar[y])
  }
  return result
}
