import {
  PointSet,
} from "./PointSet.js"

export class PointList {

  static LO = 0xffff
  static HI = 0xffff0000

  static empty() {
    return {
      size: 0,
      forEach: () => {},
    }
  }

  constructor(dim) {
    if (!dim) {
      throw new Error("expecting argument: dim")
    }
    this.capacity = 32
    this.dim = dim
    this.buffer = new Int32Array(16)
    this.pos = 0
  }

  add(x, y) {
    if (this.pos >= this.capacity) {
      let b = new Int32Array(Math.ceil((this.dim * this.dim) / 2))
      b.set(this.buffer)
      this.buffer = b
      this.capacity = this.dim * this.dim
    }
    let ptId = this.dim * y + x
    this.#set(ptId)
    this.pos++
  }

  addAll(other) {
    if (!other) {
      return
    }
    other.forEach((x, y) => this.add(x, y))
  }

  #get(i) {
    let code = this.buffer[Math.trunc(i / 2)]
    return i % 2 === 0 ? code & PointList.LO : (code >> 16)
  }

  #set(ptId) {
    let i = Math.trunc(this.pos / 2)
    if (this.pos % 2 === 0) {
      this.buffer[i] = (this.buffer[i] & PointList.HI) | ptId
    } else {
      this.buffer[i] = (ptId << 16) | (this.buffer[i] & PointList.LO)
    }
  }

  x(i) {
    let ptId = this.#get(i)
    return ptId % this.dim
  }

  y(i) {
    let ptId = this.#get(i)
    return Math.trunc(ptId / this.dim)
  }

  size() {
    return this.pos
  }

  isEmpty() {
    return !this.pos
  }

  toSet() {
    let result = new PointSet(this.dim)
    this.forEach((x, y) => result.add(x, y))
    return result
  }

  forEach(consumer) {
    for (let i = 0; i < this.pos; i++) {
      consumer(this.x(i), this.y(i))
    }
  }
}
