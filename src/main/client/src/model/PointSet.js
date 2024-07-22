export class PointSet {

  constructor(dim) {
   this.dim = dim
   this.points = new Int32Array(Math.ceil((dim * dim) / 0x20)) 
  }

  add(x, y) {
    let ptId = y * this.dim + x
    let pos = ptId >> 5
    let test = 1 << (ptId & 0x1f)
    this.points[pos] |= test
  }

  has(x, y) {
    let ptId = y * this.dim + x
    let pos = ptId >> 5
    let test = 1 << (ptId & 0x1f)
    return (this.points[pos] & test) !== 0
  }
}
