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
  useTimeoutStore,
} from "src/store.js"
import {
  useLayoutStore,
  useViewStateStore,
} from "src/layout.js"
import {
  GamePanel,
} from "./GamePanel.jsx"
import {
  initialState,
  addMove,
  createGameState,
} from "./state.js"
import {
  Board,
} from "./Board.jsx"
import { 
  BoardSettings,
} from "./BoardSettings.jsx"

export function Game() {
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let navigate = useNavigate()
  let {gameId} = useParams()
  let [gameState, setGameState] = useState(initialState())
  let queueStatus = gameState.queueStatus
  let timesetting = gameState.timesetting
  let board = gameState.board
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth.game)
  let gameStateRef = useRef()
  gameStateRef.current = gameState
  let intervalIdRef = useRef()
  let timeRemaining = useTimeoutStore(state => state.timeRemaining)
  let setTimeRemaining = useTimeoutStore(state => state.setTimeRemaining)
  let timeRemainingRef = useRef()
  timeRemainingRef.current = timeRemaining
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let cursorXref = useRef()
  cursorXref.current = cursor_x
  let cursorYref = useRef()
  cursorYref.current = cursor_y
  let canvasRef = useRef()
  let zoom = useViewStateStore(state => state.zoom)

  let resetCountdown = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
    }
    setTimeRemaining(timesetting)
    if (!timesetting) {
      return
    }
    intervalIdRef.current = setInterval(() => {
      let t = timeRemainingRef.current - 1
      setTimeRemaining(t)
      if (t <= 0) {
        clearInterval(intervalIdRef.current)
        window.setTimeout(() => {
          stompClient.publish({
            destination: "/app/game/move",
            body: JSON.stringify({ x: -1, y: -1 }),
          })
        }, Math.trunc(Math.random() * 200))
      }
    }, 1000)
  }, [setTimeRemaining, timesetting, stompClient])

  useEffect(() => {
    resetCountdown()
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [resetCountdown])

  useEffect(() => {
    let sub = stompClient.subscribe("/topic/move/" + gameId, (message) => {
      let move = JSON.parse(message.body)
      let newState = addMove(gameStateRef.current, move)
      setGameState(newState)
      resetCountdown()
    })
    return () => {
      sub.unsubscribe()
    }
  }, [gameStateRef, setGameState, stompClient, gameId, resetCountdown])

  useEffect(() => {
    if (queueStatus === "up_to_date") {
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
  }, [setGameState, queueStatus, auth, gameId, navigate])

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
  }, [board.length, canvasRef, zoom])

  if (!gameState.board.length) {
    return <div>Loading...</div>
  }

  return (
    <div
      style={{ width: vw() - sidebarWidth }}
      className="h-full">
      <BoardSettings gameId={gameId} black={gameState.black} white={gameState.white} />
      <Board
        context={context}
        cursor_x={cursor_x}
        cursor_y={cursor_y}
        setCursor_x={setCursor_x}
        setCursor_y={setCursor_y}
        resetCountdown={resetCountdown}
        timeRemaining={timeRemaining}
        gameState={gameState}
        setGameState={setGameState} />
      <GamePanel gameState={gameState} setGameState={setGameState} />
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
