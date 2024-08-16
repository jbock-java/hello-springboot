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
  base,
  StompContext,
  BLACK,
  tfetch,
  doTry,
} from "../../util.js"
import {
  PointList,
} from "../../model/PointList.js"
import {
  useAuthStore,
  useGameStore,
  useMuteStore,
} from "../../store.js"
import {
  useLayoutStore,
} from "../../layout.js"
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
  Howl,
} from "howler"
import {
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa"
import {
  IconContext,
} from "react-icons"

export const Game = () => {
  let [cursor_x, setCursor_x] = useState(-1)
  let [cursor_y, setCursor_y] = useState(-1)
  let zoom = useLayoutStore(state => state.zoom)
  let {gameId} = useParams()
  let navigate = useNavigate()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let id = useGameStore(state => state.id)
  let gameHasEnded = useGameStore(state => state.gameHasEnded)
  let lastMove = useGameStore(state => state.lastMove)
  let setGameState = useGameStore(state => state.setGameState)
  let queueStatus = useGameStore(state => state.queueStatus)
  let movesLength = useGameStore(state => state.moves.length)
  let myColor = useGameStore(state => state.myColor)
  let isSelfPlay = useGameStore(state => state.isSelfPlay)
  let addMove = useGameStore(state => state.addMove)
  let currentPlayer = useGameStore(state => state.currentPlayer)
  let counting = useGameStore(state => state.counting)
  let currentColor = useGameStore(state => state.currentColor)
  let board = useGameStore(state => state.board)
  let [forbidden_x, forbidden_y] = useGameStore(state => state.forbidden)
  let canvasRef = useRef()
  let countingGroup = !gameHasEnded() && counting ? getCountingGroup(board, cursor_x, cursor_y) : undefined
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth.game)
  let vw = useLayoutStore(state => state.vw)
  let dragging = useLayoutStore(state => state.dragging)
  let muted = useMuteStore(state => state.muted)
  let setMuteState = useMuteStore((state) => state.setMuted)
  let sound = useMemo(() => new Howl({
    src: ["/app/stone1.wav"],
    onloaderror: function (id, error) {
      throw new Error(id + ": " + error)
    }
  }),[])

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
    if (gameHasEnded()) {
      return
    }
    if (dragging) {
      return
    }
    if (!board.length) {
      return
    }
    if (!counting && currentPlayer() !== auth.name) {
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
  }, [context, currentPlayer, auth, board.length, counting, gameHasEnded, dragging])

  let onClick = useCallback((e) => {
    if (gameHasEnded()) {
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
      if (board[cursor_y][cursor_x].isForbidden(currentColor())) {
        return
      }
      if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
        return
      }
      if (currentPlayer() !== auth.name) {
        return
      }
    }
    let move = {
      n: movesLength,
      x: cursor_x,
      y: cursor_y,
    }
    if (!isSelfPlay()) { // myColor is 0 in self play
      addMove({...move, color: myColor})
    }
    if (!muted) {
      sound.play();
    }
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify(move),
    })
  }, [context, currentPlayer, currentColor, auth, board, stompClient, counting, forbidden_x, forbidden_y, gameHasEnded, movesLength, addMove, isSelfPlay, myColor, muted])

  let onMuteClick = useCallback(() => {
    if (muted) {
      setMuteState(false)
    } else {
      setMuteState(true)
    }
  }, [setMuteState, muted])

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
    if (currentPlayer() !== auth.name) {
      return
    }
    if (!context.isCursorInBounds(cursor_x, cursor_y)) {
      return
    }
    if (board[cursor_y][cursor_x].hasStone) {
      return
    }
    if (board[cursor_y][cursor_x].isForbidden(currentColor())) {
      return
    }
    if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
      return
    }
    let style = currentColor() === BLACK ?
      "rgba(0,0,0,0.25)" :
      "rgba(255,255,255,0.25)"
    paintShadow(context, cursor_x, cursor_y, style)
  }, [cursor_x, cursor_y, context, canvasRef, auth, currentColor, board, currentPlayer, counting, countingGroup, forbidden_x, forbidden_y, lastMove])

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
      setGameState(game, auth)
    }, () => navigate(base + "/lobby"))
  }, [setGameState, queueStatus, auth, id, gameId, navigate])

  useEffect(() => {
    let sub = stompClient.subscribe("/topic/move/" + gameId, (message) => {
      let move = JSON.parse(message.body)
      addMove(move)
    })
    return sub.unsubscribe
  }, [addMove, stompClient, gameId])

  if (!board.length) {
    return <div>Loading...</div>
  }

  return (
    <div
      style={{ width: (vw - sidebarWidth) + "px" }}
      className="h-full">
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
      <div
        style={{right: (sidebarWidth + 12) + "px"}}
        className="absolute bottom-4">
        <button onClick={onMuteClick}>
          <IconContext.Provider value={{
            size: "1.5em",
            className: "pl-[4px]",
          }}>
            {muted && (
              <FaVolumeMute />
            )}
            {!muted && (
              <FaVolumeUp />
            )}
          </IconContext.Provider>
        </button>
      </div>
      <GamePanel />
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
