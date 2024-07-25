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
} from "./util.js"
import {
  isForbidden,
} from "./model/board.js"
import {
  GamePanel,
} from "./feature/GamePanel.jsx"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

const kirsch = "#dfbd6d"
const asch = "#a78a48"

export const Game = () => {
  let width = 750
  let margin = 80
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let setGameState = useGameStore(state => state.setGameState)
  let { board, currentColor, currentPlayer, counting } = useGameStore(state => state.gameState)
  let initialized = useRef()
  let canvasRef = useRef()
  let context = useMemo(() => {
    if (!board.length) {
      return
    }
    let dim = board.length
    let step = (width - margin - margin) / (dim - 1)
    let grid = []
    for (let y = 0; y < dim; y++) {
      grid[y] = []
      for (let x = 0; x < dim; x++) {
        grid[y][x] = [
          Math.trunc(margin + (x * step)),
          Math.trunc(margin + (y * step)),
        ]
      }
    }
    return { width, margin, dim, step, grid, canvasRef }
  }, [width, margin, board.length, canvasRef])
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
    if (!counting && currentPlayer !== auth.name) {
      return
    }
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    if (cursor_x >= 0 &&
        cursor_x < context.dim &&
        cursor_y >= 0 &&
        cursor_y < context.dim &&
        (counting && board[cursor_y][cursor_x].hasStone || !isForbidden(board, board[cursor_y][cursor_x], currentColor))) {
        stompClient.publish({
          destination: "/app/game/move",
          body: JSON.stringify({
            id: gameId,
            x: cursor_x,
            y: cursor_y,
          }),
        })
    }
  }, [context, currentPlayer, currentColor, auth, board, gameId, stompClient, counting])
  useEffect(() => {
    if (!board.length) {
      return
    }
    paintGrid(context)
    if (counting) {
      paintStonesCounting(context, board, countingGroup)
    } else {
      paintStones(context, board)
    }
    if (!counting &&
        currentPlayer === auth.name &&
        cursor_x >= 0 &&
        cursor_x < context.dim &&
        cursor_y >= 0 &&
        cursor_y < context.dim &&
        !isForbidden(board, board[cursor_y][cursor_x], currentColor)) {
      let [x, y] = context.grid[cursor_y][cursor_x]
      let style = currentColor === BLACK ?
        "rgba(0,0,0,0.25)" :
        "rgba(255,255,255,0.25)"
      showShadow(context, x, y, style)
    }
  }, [cursor_x, cursor_y, width, context, canvasRef, auth, currentColor, board, currentPlayer, counting, countingGroup])
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/game/" + gameId, (message) => {
      let game = JSON.parse(message.body)
      setGameState(game)
    })
    stompClient.publish({
      destination: "/app/game/hello",
      body: JSON.stringify({
        id: gameId,
      }),
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setGameState, initialized, stompClient, gameId])
  if (!board.length) {
    return <div>Loading...</div>
  }
  return (
    <div className="grid justify-center mt-8">
      <canvas ref={canvasRef}
        onMouseMove={onMouseMove}
        onClick={onClick}
        width={width} height={width}>
      </canvas>
      <GamePanel />
    </div>
  )
}

function showTerritory({ canvasRef, step }, x, y, style) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.125, 0, 2 * Math.PI)
  ctx.fill()
}

function showStone({ canvasRef, step }, x, y, style) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.475, 0, 2 * Math.PI)
  ctx.fill()
}

function showShadow({ canvasRef, step }, x, y, style) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = style
  ctx.beginPath()
  ctx.arc(x, y, step * 0.475, 0, 2 * Math.PI)
  ctx.fill()
}

function paintGrid({ width, canvasRef, grid }) {
  let ctx = canvasRef.current.getContext("2d")
  ctx.fillStyle = kirsch
  ctx.fillRect(0, 0, width, width)
  ctx.strokeStyle = asch
  for (let y = 0; y < grid.length; y++) {
    let [source_x, source_y] = grid[y][0]
    let [target_x, target_y] = grid[y][grid.length - 1]
    ctx.beginPath()
    ctx.moveTo(source_x + 0.5, source_y + 0.5)
    ctx.lineTo(target_x + 0.5, target_y + 0.5)
    ctx.stroke()
  }
  for (let x = 0; x < grid.length; x++) {
    let [source_x, source_y] = grid[0][x]
    let [target_x, target_y] = grid[grid.length - 1][x]
    ctx.beginPath()
    ctx.moveTo(source_x + 0.5, source_y + 0.5)
    ctx.lineTo(target_x + 0.5, target_y + 0.5)
    ctx.stroke()
  }
}

function paintStones(context, board) {
  for (let logical_y = 0; logical_y < board.length; logical_y++) {
    for (let logical_x = 0; logical_x < board.length; logical_x++) {
      let { hasStone, color } = board[logical_y][logical_x]
      if (hasStone) {
        let [x, y] = context.grid[logical_y][logical_x]
        let style = color === BLACK ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        showStone(context, x, y, style)
      }
    }
  }
}

function paintStonesCounting(context, board, countingGroup) {
  for (let logical_y = 0; logical_y < board.length; logical_y++) {
    for (let logical_x = 0; logical_x < board.length; logical_x++) {
      let { hasStone, color } = board[logical_y][logical_x]
      let [x, y] = context.grid[logical_y][logical_x]
      if (hasStone) {
        if (countingGroup && countingGroup(logical_x, logical_y)) {
          let style = color & BLACK ?
            "rgba(0,0,0,0.25)" :
            "rgba(255,255,255,0.25)"
          showShadow(context, x, y, style)
        } else {
          let style = color & BLACK ?
            "rgba(0,0,0)" :
            "rgba(255,255,255)"
          showStone(context, x, y, style)
        }
      } else if (color & ANY_TERRITORY) {
        if (color & ANY_REMOVED) {
          let style = (color & ANY_REMOVED) === REMOVED_B ?
            "rgba(0,0,0,0.25)" :
            "rgba(255,255,255,0.25)"
          showShadow(context, x, y, style)
        }
        let style = (color & ANY_TERRITORY) === TERRITORY_B ?
          "rgba(0,0,0)" :
          "rgba(255,255,255)"
        showTerritory(context, x, y, style)
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
