import {
  expect,
  test,
} from "vitest"
import {
  PointQueue,
} from "./PointQueue.js"

test("offerAndPoll", () => {
  let dim = 4
  let queue = new PointQueue(dim)
  queue.offer(0, 1)
  queue.offer(1, 2)
  poll(queue, 0, 1)
  queue.offer(2, 3)
  poll(queue, 1, 2)
  poll(queue, 2, 3)
  expect(queue.isEmpty()).toBe(true)
})

function poll(queue, expect_x, expect_y) {
  expect(queue.isEmpty()).toBe(false)
  let ptId = queue.poll()
  let x = ptId % queue.dim
  let y = Math.floor(ptId / queue.dim)
  expect(x).toBe(expect_x)
  expect(y).toBe(expect_y)
}
