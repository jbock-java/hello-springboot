import {
  BLACK,
  TERRITORY,
  TERRITORY_B,
  REMOVED_B,
  ANY_REMOVED,
} from "src/util.js"

const kirsch = "#dfbd6d"
const asch = "#8c7130"
const TAU = 2 * Math.PI
const decoX = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"]

export function paintGrid({width, margin, canvasRef, grid, hoshis, hoshiRadius}) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = kirsch
  ctx.fillRect(0.625 * margin, 0.625 * margin, width - 1.25 * margin, width - 1.25 * margin)
  ctx.strokeStyle = asch
  for (let y = 0; y < grid.length; y++) {
    let [source_x, source_y] = grid[y][0]
    let [target_x, target_y] = grid[y][grid.length - 1]
    ctx.beginPath()
    ctx.moveTo(source_x, source_y)
    ctx.lineTo(target_x, target_y)
    ctx.stroke()
  }
  for (let x = 0; x < grid.length; x++) {
    let [source_x, source_y] = grid[0][x]
    let [target_x, target_y] = grid[grid.length - 1][x]
    ctx.beginPath()
    ctx.moveTo(source_x, source_y)
    ctx.lineTo(target_x, target_y)
    ctx.stroke()
  }
  hoshis.forEach((grid_x, grid_y) => {
    let [x, y] = grid[grid_y][grid_x]
    ctx.fillStyle = asch
    ctx.beginPath()
    ctx.arc(x, y, hoshiRadius, 0, TAU)
    ctx.fill()
  })
}

export function paintBoardDecorations({width, margin, canvasRef, grid}) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = kirsch
  ctx.fillRect(0, 0, width, width)
  ctx.fillStyle = asch
  let size = Math.trunc(margin / 4)
  ctx.font = size + "px sans-serif"
  ctx.textAlign = "center"
  for (let grid_x = 0; grid_x < grid.length; grid_x++) {
    let [x] = grid[0][grid_x]
    ctx.textBaseline = "top"
    ctx.fillText(decoX[grid_x], x, 0.25 * margin)
    ctx.textBaseline = "alphabetic"
    ctx.fillText(decoX[grid_x], x, width - 0.25 * margin)
  }
  ctx.textBaseline = "middle"
  for (let grid_y = 0; grid_y < grid.length; grid_y++) {
    let [, y] = grid[grid.length - grid_y - 1][0]
    ctx.textAlign = "start"
    ctx.fillText(grid_y + 1, 0.125 * margin, y)
    ctx.textAlign = "end"
    ctx.fillText(grid_y + 1, width -  0.125 * margin, y)
  }
}

export function paintShadow({canvasRef, grid, stoneRadius}, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, stoneRadius, 0, TAU)
  ctx.fill()
}

export function paintStones(context, board, lastMove) {
  let ctrlKeyDown = context.ctrlKeyDownRef.current
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let {hasStone, color} = board[grid_y][grid_x]
      if (hasStone) {
        let style = color === BLACK ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        paintStone(context, grid_x, grid_y, style)
        if (ctrlKeyDown) {
          console.log("ctrlKeyDown: " + grid_x + " " + grid_y)
        }
      }
    }
  }
  paintLastMove(context, lastMove)
}

export function paintStonesCounting(context, board, countingGroup) {
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let { hasStone, color } = board[grid_y][grid_x]
      if (hasStone) {
        if (countingGroup && countingGroup(grid_x, grid_y)) {
          let style = color & BLACK ?
            "rgba(0,0,0,0.25)" :
            "rgba(255,255,255,0.25)"
          paintShadow(context, grid_x, grid_y, style)
        } else {
          let style = color & BLACK ?
            "rgba(0,0,0)" :
            "rgba(255,255,255)"
          paintStone(context, grid_x, grid_y, style)
        }
      }
      if (color & ANY_REMOVED) {
        let style = (color & ANY_REMOVED) === REMOVED_B ?
          "rgba(0,0,0,0.25)" :
          "rgba(255,255,255,0.25)"
        paintShadow(context, grid_x, grid_y, style)
      }
      if (color & TERRITORY) {
        let style = (color & TERRITORY) === TERRITORY_B ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        paintTerritory(context, grid_x, grid_y, style)
      }
    }
  }
}

function paintTerritory({canvasRef, grid, territoryRadius}, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, territoryRadius, 0, TAU)
  ctx.fill()
}

function paintStone({canvasRef, grid, stoneRadius}, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, stoneRadius, 0, TAU)
  ctx.fill()
}

function paintLastMove({isCursorInBounds, canvasRef, grid, stoneRadius}, lastMove) {
  if (!lastMove) {
    return
  }
  let {x: grid_x, y: grid_y, color} = lastMove
  if (!isCursorInBounds(grid_x, grid_y)) {
    return
  }
  let style = color === BLACK ?
    "rgba(255,255,255)" :
    "rgba(0,0,0)"
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  let length = stoneRadius * 0.875
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + length, y)
  ctx.lineTo(x , y + length)
  ctx.fill()
}
