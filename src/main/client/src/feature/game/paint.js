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

export function paintShadow({canvasRef, grid, stoneRadius}, grid_x, grid_y, color) {
  let style = (color & (BLACK | REMOVED_B)) ?
    "rgba(0,0,0,0.25)" :
    "rgba(255,255,255,0.25)"
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, stoneRadius, 0, TAU)
  ctx.fill()
}

export function paintStones(context, board, showMoveNumbers) {
  let cursor_x = context.cursorXref.current
  let cursor_y = context.cursorYref.current
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let {hasStone, color, historyEntry} = board[grid_y][grid_x]
      let isHover = showMoveNumbers && historyEntry.n !== -1 && grid_x === cursor_x && grid_y === cursor_y
      if (hasStone && isHover) {
        paintStone(context, grid_x, grid_y, historyEntry.color)
      } else if (isHover) {
        paintStone(context, grid_x, grid_y, historyEntry.color)
      } else if (hasStone) {
        paintStone(context, grid_x, grid_y, color)
      }
    }
  }
}

export function paintMoveNumbers(context, board) {
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let {color, historyEntry} = board[grid_y][grid_x]
      paintMoveNumber(context, grid_x, grid_y, color, historyEntry)
    }
  }
}

export function paintStonesCounting(context, board, countingGroup) {
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let {hasStone, color} = board[grid_y][grid_x]
      if (countingGroup && countingGroup(grid_x, grid_y)) {
        paintShadow(context, grid_x, grid_y, color)
      } else if (hasStone) {
        paintStone(context, grid_x, grid_y, color)
      } else if (color & ANY_REMOVED) {
        paintShadow(context, grid_x, grid_y, color)
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

function paintStone({canvasRef, grid, stoneRadius}, grid_x, grid_y, color) {
  let outerStyle = color === BLACK ?
    "#505050" :
    "#fff"
  let innerStyle = color === BLACK ?
    "rgba(80,80,80,0)" :
    "hsla(0,0%,100%,0)"
  let [x, y] = grid[grid_y][grid_x]
  let offset = Math.trunc(stoneRadius / 4)
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = color === BLACK ? "#111" : "#ddd"
  ctx.beginPath()
  ctx.arc(x, y, stoneRadius, 0, TAU)
  ctx.fill()
  let gradient = ctx.createRadialGradient(x - offset, y - offset, 0, x - offset, y - offset, stoneRadius)
  gradient.addColorStop(color === BLACK ? 0.55 : 0.7, innerStyle);
  gradient.addColorStop(color === BLACK ? 0.1 : 0.2, outerStyle);
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, stoneRadius, 0, TAU)
  ctx.fill()
}

function paintMoveNumber({cursorXref, cursorYref, stoneRadius, canvasRef, grid}, grid_x, grid_y, color, historyEntry) {
  if (historyEntry.n === -1) {
    return
  }
  let cursor_x = cursorXref.current
  let cursor_y = cursorYref.current
  let textColor
  if (cursor_x === grid_x && cursor_y === grid_y) {
    textColor = historyEntry.color === BLACK ?
      "rgba(255,255,255)" :
      "rgba(0,0,0)"
  } else {
    textColor = (color & (BLACK | TERRITORY_B)) ?
      "rgba(255,255,255)" :
      "rgba(0,0,0)"
  }
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.font = (cursor_x === grid_x && cursor_y === grid_y) ?
    ("bold " + Math.trunc(stoneRadius * 1.125) + "px sans-serif") :
    Math.trunc(stoneRadius * 0.75) + "px sans-serif"
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillStyle = textColor
  ctx.fillText(historyEntry.n + 1, x, y)
}

export function paintNumber(context, grid_x, grid_y, n, color) {
  let {canvasRef, grid, stoneRadius} = context
  let ctx = canvasRef.current.getContext("2d")
  let [x, y] = grid[grid_y][grid_x]
  let style = color === BLACK ?
    "rgba(255,255,255)" :
    "rgba(0,0,0)"
  ctx.font = "bold " + Math.trunc(stoneRadius * 1.125) + "px sans-serif"
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillStyle = style
  ctx.fillText(n, x, y)
}

export function paintLastMove(context, lastMove, timeRemaining) {
  if (!lastMove) {
    return
  }
  let {canvasRef, grid, stoneRadius} = context
  let {x: grid_x, y: grid_y, color} = lastMove
  let style = color === BLACK ?
    "rgba(255,255,255)" :
    "rgba(0,0,0)"
  paintStone(context, grid_x, grid_y, color)
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  if (timeRemaining > 0 && timeRemaining < 10) {
    paintNumber(context, grid_x, grid_y, timeRemaining, color)
    return
  }
  let length = stoneRadius * 0.875
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + length, y)
  ctx.lineTo(x , y + length)
  ctx.fill()
}
