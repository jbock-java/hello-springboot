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
  useNavigate,
} from "react-router-dom"
import {
  Howl,
} from "howler"
import {
  IconContext,
} from "react-icons"
import {
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa"
import {
  vw,
  base,
  StompContext,
  BLACK,
  tfetch,
  doTry,
} from "src/util.js"
import {
  PointList,
} from "src/model/PointList.js"
import {
  useAuthStore,
  useMuteStore,
  useGameTicker,
} from "src/store.js"
import {
  useLayoutStore,
  useViewStateStore,
} from "src/layout.js"
import {
  paintShadow,
  paintGrid,
  paintBoardDecorations,
  paintStones,
  paintStonesCounting,
} from "./paint.js"
import {
  GamePanel,
} from "./GamePanel.jsx"
import {
  initialState,
  currentPlayer,
  isSelfPlay,
  currentColor,
  gameHasEnded,
  addMove,
  createGameState,
} from "./state.js"

export function Game() {
  let [gameState, setGameState] = useState(initialState())
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth.game)
  return (
    <div
      style={{ width: vw() - sidebarWidth }}
      className="h-full">
      <MuteIcon />
      <Board gameState={gameState} setGameState={setGameState} />
      <GamePanel gameState={gameState} setGameState={setGameState} />
    </div>
  )
}

function Board({gameState, setGameState}) {
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let zoom = useViewStateStore(state => state.zoom)
  let {gameId} = useParams()
  let toggleGameTicker = useGameTicker(state => state.toggleGameTicker)
  let navigate = useNavigate()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let id = gameState.id
  let lastMove = gameState.lastMove
  let queueStatus = gameState.queueStatus
  let movesLength = gameState.moves.length
  let myColor = gameState.myColor
  let counting = gameState.counting
  let board = gameState.board
  let [forbidden_x, forbidden_y] = gameState.forbidden
  let canvasRef = useRef()
  let countingGroup = !gameHasEnded(gameState) && counting ? getCountingGroup(board, cursor_x, cursor_y) : undefined
  let dragging = useLayoutStore(state => state.dragging)
  let muted = useMuteStore(state => state.muted)
  let howler = useRef()
  let playClickSound = useCallback(() => {
    if (muted) {
      return
    }
    if (!howler.current) {
      howler.current = new Howl({
        src: ["/app/stone1.wav"],
        onloaderror: (id, error) => {
          throw new Error(id + ": " + error)
        },
      })
    }
    howler.current.play()
  }, [howler, muted])

  let context = useMemo(() => {
    let dim = board.length
    if (!dim) {
      return
    }
    let width = 0.9375 * Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    let margin = 1.125 * width / (dim - 1)
    let step = (width - margin - margin) / (dim - 1)
    let zoomFactor = 1 + (zoom * 0.0625)
    width = Math.trunc(width * zoomFactor)
    margin = Math.trunc(margin * zoomFactor)
    step = step * zoomFactor
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
      hoshis.add(4, 4)
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
      stoneRadius: getRadius(step * 0.475),
      territoryRadius: getRadius(step * 0.125),
      hoshiRadius: getRadius(step * 0.0625),
    }
  }, [board.length, canvasRef, zoom])

  let onMouseMove = useCallback((e) => {
    if (gameHasEnded(gameState)) {
      return
    }
    if (dragging) {
      return
    }
    if (!board.length) {
      return
    }
    if (!counting && currentPlayer(gameState) !== auth.name) {
      return
    }
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    if (context.isCursorInBounds(cursor_x, cursor_y)) {
      setCursor_x(cursor_x + 0)
      setCursor_y(cursor_y + 0)
    } else {
      setCursor_x(-1)
      setCursor_y(-1)
    }
  }, [gameState, context, auth, board.length, counting, dragging])

  let onClick = useCallback((e) => {
    if (gameHasEnded(gameState)) {
      return
    }
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
      if (board[cursor_y][cursor_x].isForbidden(currentColor(gameState))) {
        return
      }
      if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
        return
      }
      if (currentPlayer(gameState) !== auth.name) {
        return
      }
    }
    let move = {
      n: movesLength,
      x: cursor_x,
      y: cursor_y,
    }
    if (!isSelfPlay(gameState)) { // myColor is 0 in self play
      setGameState(addMove(gameState, {...move, color: myColor}))
      toggleGameTicker()
    }
    playClickSound()
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify(move),
    })
  }, [gameState, setGameState, toggleGameTicker, context, auth, board, stompClient, counting, forbidden_x, forbidden_y, movesLength, myColor, playClickSound])

  useEffect(() => {
    if (!board.length) {
      return
    }
    paintBoardDecorations(context)
  }, [context, board.length])

  useEffect(() => {
    if (!board.length) {
      return
    }
    paintGrid(context)
    if (counting) {
      paintStonesCounting(context, board, countingGroup)
      return
    } else {
      paintStones(context, board, lastMove)
    }
    if (currentPlayer(gameState) !== auth.name) {
      return
    }
    if (!context.isCursorInBounds(cursor_x, cursor_y)) {
      return
    }
    if (board[cursor_y][cursor_x].hasStone) {
      return
    }
    if (board[cursor_y][cursor_x].isForbidden(currentColor(gameState))) {
      return
    }
    if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
      return
    }
    let style = currentColor(gameState) === BLACK ?
      "rgba(0,0,0,0.25)" :
      "rgba(255,255,255,0.25)"
    paintShadow(context, cursor_x, cursor_y, style)
  }, [gameState, cursor_x, cursor_y, context, canvasRef, auth, board, counting, countingGroup, forbidden_x, forbidden_y, lastMove])

  useEffect(() => {
    if (id === gameId && queueStatus === "up_to_date") {
      return
    }
    doTry(async () => {
      let game = await tfetch("/api/game/" + gameId, {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
      setGameState(createGameState(game, auth))
      toggleGameTicker()
    }, () => navigate(base + "/lobby"))
  }, [setGameState, toggleGameTicker, queueStatus, auth, id, gameId, navigate])

  useEffect(() => {
    let sub = stompClient.subscribe("/topic/move/" + gameId, (message) => {
      let move = JSON.parse(message.body)
      setGameState(addMove(gameState, move))
      toggleGameTicker()
    })
    return sub.unsubscribe
  }, [gameState, setGameState, toggleGameTicker, stompClient, gameId])

  if (!board.length) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid h-full">
      <canvas className="place-self-center" ref={canvasRef}
        onMouseLeave={() => {
          setCursor_x(-1)
          setCursor_y(-1)
        }}
        onMouseMove={onMouseMove}
        onClick={onClick}
        width={context.width} height={context.width}>
      </canvas>
    </div>
  )
}

function getRadius(radius) {
  let diameter = Math.trunc(2 * radius)
  if (diameter % 2 === 0) {
    diameter += 1
  }
  return diameter / 2
}

function getCountingGroup(board, cursor_x, cursor_y) {
  if (cursor_x < 0 ||
      cursor_x >= board.length ||
      cursor_y < 0 ||
      cursor_y >= board.length ) {
    return undefined
  }
  let {has, hasStone} = board[cursor_y][cursor_x]
  if (!hasStone) {
    return undefined
  }
  return has
}

function MuteIcon() {
  let toggleMuted = useMuteStore((state) => state.toggleMuted)
  let muted = useMuteStore(state => state.muted)
  return (
    <div className="absolute left-2 top-2">
      <button onClick={toggleMuted}>
        <IconContext.Provider value={{
          size: "1.5em",
          className: "pl-[4px]",
        }}>
          {muted ? <FaVolumeMute /> : <FaVolumeUp /> }
        </IconContext.Provider>
      </button>
    </div>
  )
}
