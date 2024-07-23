export class PointQueue {

  static LO = 0xffff;
  static HI = 0xffff0000;

  constructor(dim) {
    this.dim = dim
    this.capacity = 2 * dim
    this.buffer = new Int32Array(dim)
    this.read = 0
    this.write = 0
    this.empty = true
  }

  offer(x, y) {
    if (!this.empty && this.write === this.read) {
      throw new Error("buffer overflow")
    }
    this.empty = false
    let ptId = y * this.dim + x
    this.#set(ptId)
    this.write = (this.write + 1) % this.capacity
  }

  poll() {
    let ptId = this.#get()
    this.read = (this.read + 1) % this.capacity
    if (this.read === this.write) {
      this.empty = true
    }
    return ptId
  }

  #get() {
    let code = this.buffer[Math.floor(this.read / 2)]
    return this.read % 2 === 0 ? code & PointQueue.LO : (code >> 16)
  }

  #set(ptId) {
    let pos = Math.floor(this.write / 2)
    if (this.write % 2 === 0) {
      this.buffer[pos] = (this.buffer[pos] & PointQueue.HI) | ptId
    } else {
      this.buffer[pos] = (ptId << 16) | (this.buffer[pos] & PointQueue.LO)
    }
  }

  isEmpty() {
    return this.empty
  }
}
