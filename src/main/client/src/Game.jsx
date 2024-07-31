import {
  useEffect,
  useCallback,
  useState,
  useContext,
  useRef,
  useMemo,
} from "react"
import {
  useParams,
} from "react-router-dom"
import {
  StompContext,
  BLACK,
  ANY_TERRITORY,
  TERRITORY_B,
  REMOVED_B,
  ANY_REMOVED,
  tfetch,
  doTry,
} from "./util.js"
import {
  isForbidden,
} from "./model/board.js"
import {
  PointList,
} from "./model/PointList.js"
import {
  GamePanel,
} from "./feature/GamePanel.jsx"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

const kirsch = "#dfbd6d"
const asch = "#8c7130"
const TAU = 2 * Math.PI

export const Game = () => {
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let [zoom, setZoom] = useState(0)
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let setGameState = useGameStore(state => state.setGameState)
  let { board, currentColor, currentPlayer, counting, forbidden } = useGameStore(state => state.gameState)
  let [forbidden_x, forbidden_y] = forbidden
  let initialized = useRef()
  let canvasRef = useRef()
  let context = useMemo(() => {
    let dim = board.length
    if (!dim) {
      return
    }
    let width = 0.9375 * Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    let margin = 1.125 * width / dim
    let step = (width - margin - margin) / (dim - 1)
    let zoomFactor = 1 + (zoom * 0.0625)
    width = Math.trunc(width * zoomFactor)
    margin = Math.trunc(margin * zoomFactor)
    step = Math.trunc(step * zoomFactor)
    let grid = []
    for (let y = 0; y < dim; y++) {
      grid[y] = []
      for (let x = 0; x < dim; x++) {
        grid[y][x] = [
          Math.trunc(margin + (x * step)) + 0.5,
          Math.trunc(margin + (y * step)) + 0.5,
        ]
      }
    }
    let hoshis = new PointList(dim)
    if (dim === 9) {
      hoshis.add(2, 2)
      hoshis.add(2, 6)
      hoshis.add(4, 4)
      hoshis.add(6, 2)
      hoshis.add(6, 6)
    } else if (dim === 13) {
      hoshis.add(3, 3)
      hoshis.add(3, 9)
      hoshis.add(6, 6)
      hoshis.add(9, 3)
      hoshis.add(9, 9)
    } else if (dim === 19) {
      hoshis.add(3, 3)
      hoshis.add(3, 9)
      hoshis.add(3, 15)
      hoshis.add(9, 3)
      hoshis.add(9, 9)
      hoshis.add(9, 15)
      hoshis.add(15, 3)
      hoshis.add(15, 9)
      hoshis.add(15, 15)
    }
    return {
      width,
      margin,
      dim,
      step,
      grid,
      canvasRef,
      isCursorInBounds: function(x, y) {
        return x >= 0 && x < dim && y >= 0 && y < dim
      },
      hoshis: hoshis,
    }
  }, [board.length, canvasRef, zoom])
  let onMouseMove = useCallback((e) => {
    if (!board.length) {
      return
    }
    if (!counting && currentPlayer !== auth.name) {
      return
    }
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    setCursor_x(cursor_x + 0)
    setCursor_y(cursor_y + 0)
  }, [context, currentPlayer, auth, board.length, counting])
  let countingGroup = counting ? getCountingGroup(board, cursor_x, cursor_y) : undefined
  let onClick = useCallback((e) => {
    if (!board.length) {
      return
    }
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    if (!context.isCursorInBounds(cursor_x, cursor_y)) {
      return
    }
    if (counting) {
      if (!board[cursor_y][cursor_x].hasStone) {
        return
      }
    } else {
      if (isForbidden(board, board[cursor_y][cursor_x], currentColor)) {
        return
      }
      if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
        return
      }
      if (currentPlayer !== auth.name) {
        return
      }
    }
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        x: cursor_x,
        y: cursor_y,
      }),
    })
  }, [context, currentPlayer, currentColor, auth, board, gameId, stompClient, counting, forbidden_x, forbidden_y])
  useEffect(() => {
    if (!board.length) {
      return
    }
    paintGrid(context)
    if (counting) {
      paintStonesCounting(context, board, countingGroup)
      return
    } else {
      paintStones(context, board)
    }
    if (currentPlayer !== auth.name) {
      return
    }
    if (!context.isCursorInBounds(cursor_x, cursor_y)) {
      return
    }
    if (isForbidden(board, board[cursor_y][cursor_x], currentColor)) {
      return
    }
    if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
      return
    }
    let style = currentColor === BLACK ?
      "rgba(0,0,0,0.25)" :
      "rgba(255,255,255,0.25)"
    showShadow(context, cursor_x, cursor_y, style)
  }, [cursor_x, cursor_y, context, canvasRef, auth, currentColor, board, currentPlayer, counting, countingGroup, forbidden_x, forbidden_y])
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/game/" + gameId, (message) => {
      let game = JSON.parse(message.body)
      setGameState(game)
    })
    doTry(async () => {
      await tfetch("/api/game/hello", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: gameId,
        }),
      })
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setGameState, initialized, stompClient, gameId, auth])
  if (!board.length) {
    return <div>Loading...</div>
  }
  return (
    <div className="grid justify-center mt-8">
      <canvas ref={canvasRef}
        onMouseLeave={() => {
          setCursor_x(-1)
          setCursor_y(-1)
        }}
        onMouseMove={onMouseMove}
        onClick={onClick}
        width={context.width} height={context.width}>
      </canvas>
      <GamePanel zoom={zoom} setZoom={setZoom} />
    </div>
  )
}

function showTerritory({ canvasRef, step, grid }, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.125, 0, TAU)
  ctx.fill()
}

function showStone({ canvasRef, step, grid }, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.475, 0, TAU)
  ctx.fill()
}

function showShadow({ canvasRef, step, grid }, grid_x, grid_y, style) {
  let [x, y] = grid[grid_y][grid_x]
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.475, 0, TAU)
  ctx.fill()
}

function paintGrid({ width, canvasRef, grid, step, hoshis }) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = kirsch
  ctx.fillRect(0, 0, width, width)
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
  let hoshiRadius = Math.trunc(step * 0.0625)
  if (hoshiRadius % 2 === 0) {
    hoshiRadius += 1
  }
  hoshis.forEach((grid_x, grid_y) => {
    let [x, y] = grid[grid_y][grid_x]
    ctx.fillStyle = asch
    ctx.beginPath()
    ctx.arc(x, y, hoshiRadius, 0, TAU)
    ctx.fill()
  })
}

function paintStones(context, board) {
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let { hasStone, color } = board[grid_y][grid_x]
      if (hasStone) {
        let style = color === BLACK ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        showStone(context, grid_x, grid_y, style)
      }
    }
  }
}

function paintStonesCounting(context, board, countingGroup) {
  for (let grid_y = 0; grid_y < board.length; grid_y++) {
    for (let grid_x = 0; grid_x < board.length; grid_x++) {
      let { hasStone, color } = board[grid_y][grid_x]
      if (hasStone) {
        if (countingGroup && countingGroup(grid_x, grid_y)) {
          let style = color & BLACK ?
            "rgba(0,0,0,0.25)" :
            "rgba(255,255,255,0.25)"
          showShadow(context, grid_x, grid_y, style)
        } else {
          let style = color & BLACK ?
            "rgba(0,0,0)" :
            "rgba(255,255,255)"
          showStone(context, grid_x, grid_y, style)
        }
      }
      if (color & ANY_REMOVED) {
        let style = (color & ANY_REMOVED) === REMOVED_B ?
          "rgba(0,0,0,0.25)" :
          "rgba(255,255,255,0.25)"
        showShadow(context, grid_x, grid_y, style)
      }
      if (color & ANY_TERRITORY) {
        let style = (color & ANY_TERRITORY) === TERRITORY_B ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        showTerritory(context, grid_x, grid_y, style)
      }
    }
  }
}

function getCountingGroup(board, cursor_x, cursor_y) {
  if (cursor_x < 0 ||
      cursor_x >= board.length ||
      cursor_y < 0 ||
      cursor_y >= board.length ) {
    return undefined
  }
  let { has, hasStone } = board[cursor_y][cursor_x]
  if (!hasStone) {
    return undefined
  }
  return has
}
