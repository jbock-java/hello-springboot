import {
  twJoin,
} from "tailwind-merge"
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
  vw,
  base,
  StompContext,
  tfetch,
  doTry,
} from "src/util.js"
import {
  PointList,
} from "src/model/PointList.js"
import {
  useAuthStore,
  useMuteStore,
  useTimeoutStore,
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
  paintLastMove,
  paintMoveNumbers,
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
  isKibitz,
  createGameState,
  isReviewing,
  teleport,
} from "./state.js"
import { 
  BoardSettings,
} from "./BoardSettings.jsx"

export function Game() {
  let [gameState, setGameState] = useState(initialState())
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth.game)
  return (
    <div
      style={{ width: vw() - sidebarWidth }}
      className="h-full">
      <BoardSettings gameId={gameState.id} black={gameState.black} white={gameState.white} />
      <Board gameState={gameState} setGameState={setGameState} />
      <GamePanel gameState={gameState} setGameState={setGameState} />
    </div>
  )
}

function Board({gameState, setGameState}) {
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let timeout = useTimeoutStore(state => state.timeout)
  let setTimeout = useTimeoutStore(state => state.setTimeout)
  let timeoutRef = useRef()
  timeoutRef.current = timeout
  let [ctrlKeyDown, setCtrlKeyDown] = useState(false)
  let zoom = useViewStateStore(state => state.zoom)
  let {gameId} = useParams()
  let navigate = useNavigate()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let cursorXref = useRef()
  cursorXref.current = cursor_x
  let cursorYref = useRef()
  cursorYref.current = cursor_y
  let id = gameState.id
  let lastMove = gameState.lastMove
  let queueStatus = gameState.queueStatus
  let myColor = gameState.myColor
  let counting = gameState.counting
  let board = gameState.board
  let [forbidden_x, forbidden_y] = gameState.forbidden
  let canvasRef = useRef()
  let dragging = useLayoutStore(state => state.dragging)
  let muted = useMuteStore(state => state.muted)
  let howler = useRef()
  let end = gameHasEnded(gameState)
  let showMoveNumbers = ctrlKeyDown && (isKibitz(gameState, auth) || end)
  let intervalIdRef = useRef()

  let resetCountdown = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
    }
    setTimeout(10)
    intervalIdRef.current = setInterval(() => {
      setTimeout(timeoutRef.current - 1)
    }, 1000)

  }, [setTimeout])

  useEffect(() => {
    resetCountdown()
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [resetCountdown])

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

  useEffect(() => {
    let onKeyDown = (e) => {
      let activeElement = window.document.activeElement
      if (e.shiftKey && activeElement?.id === "chat-input") {
        return
      }
      if (e.ctrlKey || e.shiftKey) {
        setCtrlKeyDown(true)
      }
    }
    let onKeyUp = (e) => {
      if (!e.shiftKey && !e.shiftKey) {
        setCtrlKeyDown(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [setCtrlKeyDown])

  let isCursorInBounds = useCallback(() => {
    let dim = board.length
    let x = cursorXref.current
    let y = cursorYref.current
    return x >= 0 && x < dim && y >= 0 && y < dim
  }, [board.length])

  let getCountingGroup = useCallback(() => {
    if (end || !counting) {
      return undefined
    }
    if (!isCursorInBounds()) {
      return undefined
    }
    let x = cursorXref.current
    let y = cursorYref.current
    let {has, hasStone} = board[y][x]
    if (!hasStone) {
      return undefined
    }
    return has
  }, [counting, board, isCursorInBounds, end])

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
      cursorXref,
      cursorYref,
      hoshis: hoshis,
      stoneRadius: getRadius(step * 0.475),
      territoryRadius: getRadius(step * 0.125),
      hoshiRadius: getRadius(step * 0.0625),
    }
  }, [board, canvasRef, zoom])

  useEffect(() => {
    if (!showMoveNumbers && !counting && !end) {
      paintLastMove(context, lastMove, timeout)
    }
  }, [showMoveNumbers, context, lastMove, timeout, counting, end])

  let onMouseMove = useCallback((e) => {
    if (dragging) {
      return
    }
    if (!board.length) {
      return
    }
    let dim = board.length
    setCtrlKeyDown(e.shiftKey || e.ctrlKey)
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    if (cursor_x >= 0 && cursor_x < dim && cursor_y >= 0 && cursor_y < dim) {
      setCursor_x(cursor_x + 0)
      setCursor_y(cursor_y + 0)
    } else {
      setCursor_x(-1)
      setCursor_y(-1)
    }
  }, [context, board.length, dragging])

  let onClick = useCallback(() => {
    let cursor_x = cursorXref.current
    let cursor_y = cursorYref.current
    if (showMoveNumbers) {
      let historyEntry = board[cursor_y][cursor_x].historyEntry
      if (historyEntry.n !== -1) {
        setGameState(teleport(gameState, historyEntry.n + 1))
      }
      return
    }
    if (end) {
      return
    }
    if (!board.length) {
      return
    }
    if (!isCursorInBounds()) {
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
      x: cursor_x,
      y: cursor_y,
    }
    if (!isSelfPlay(gameState)) { // can't add early in self play; myColor is 0
      setGameState(addMove(gameState, {...move, color: myColor})) // early add move
    }
    resetCountdown()
    playClickSound()
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify(move),
    })
  }, [gameState, setGameState, auth, board, stompClient, counting, forbidden_x, forbidden_y, myColor, playClickSound, isCursorInBounds, showMoveNumbers, resetCountdown, end])

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
    if (counting && !showMoveNumbers && !isReviewing(gameState)) {
      paintStonesCounting(context, board, getCountingGroup())
      return
    }
    paintStones(context, board, showMoveNumbers)
    if (showMoveNumbers) {
      paintMoveNumbers(context, board)
    } else if (!counting && !end) {
      paintLastMove(context, lastMove, timeoutRef.current)
    } else {
      paintLastMove(context, lastMove)
    }
    if (currentPlayer(gameState) !== auth.name) {
      return
    }
    if (!isCursorInBounds()) {
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
    if (!showMoveNumbers && !counting && !end) {
      paintShadow(context, cursor_x, cursor_y, currentColor(gameState))
    }
  }, [gameState, context, cursor_x, cursor_y, ctrlKeyDown, canvasRef, auth, board, counting, forbidden_x, forbidden_y, lastMove, isCursorInBounds, getCountingGroup, showMoveNumbers, end])

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
    }, () => navigate(base + "/lobby"))
  }, [setGameState, queueStatus, auth, id, gameId, navigate])

  useEffect(() => {
    let sub = stompClient.subscribe("/topic/move/" + gameId, (message) => {
      let move = JSON.parse(message.body)
      setGameState(addMove(gameState, move))
      resetCountdown()
    })
    return sub.unsubscribe
  }, [gameState, setGameState, stompClient, gameId, resetCountdown])

  if (!board.length) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid h-full">
      <canvas className={twJoin(
          "place-self-center",
          isCursorInBounds() && showMoveNumbers && board[cursor_y][cursor_x].historyEntry.n !== -1 && "cursor-pointer",
        )}
        ref={canvasRef}
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
