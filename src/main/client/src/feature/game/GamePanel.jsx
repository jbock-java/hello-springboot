import {
  useCallback,
  useContext,
} from "react"
import {
  useNavigate,
} from "react-router-dom"
import {
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa"
import {
  IoMdExit,
} from "react-icons/io"
import {
  IconContext,
} from "react-icons"
import {
  StompContext,
  BLACK,
  WHITE,
  TERRITORY_B,
  TERRITORY_W,
  base,
} from "../../util.js"
import {
  Button,
} from "../../component/Button.jsx"
import {
  useAuthStore,
  useGameStore,
} from "../../store.js"
import {
  useLayoutStore,
} from "../../layout.js"
import {
  GameChat,
} from "./GameChat.jsx"
import {
  SideBar,
} from "../../component/SideBar.jsx"

export const GamePanel = () => {
  return (
    <SideBar page="game">
      <div className="pr-3 pt-4 pl-2 h-full flex flex-col gap-y-1">
        <Panel />
      </div>
    </SideBar>
  )
}

function Panel() {
  let zoom = useLayoutStore(state => state.zoom)
  let setZoom = useLayoutStore(state => state.setZoom)
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let black = useGameStore(state => state.black)
  let white = useGameStore(state => state.white)
  let isSelfPlay = black === white
  let queueLength = useGameStore(state => state.queueLength)
  let movesLength = useGameStore(state => state.moves.length)
  let counting = useGameStore(state => state.counting)
  let countingAgreed = useGameStore(state => state.countingAgreed)
  let gameHasEnded = useGameStore(state => state.gameHasEnded)
  let countingComplete = useGameStore(state => state.countingComplete)
  let currentPlayer = useGameStore(state => state.currentPlayer)
  let board = useGameStore(state => state.board)
  let navigate = useNavigate()
  let onExit = useCallback(() => {
    navigate(base + "/lobby")
  }, [navigate])
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        n: movesLength,
        action: "pass",
      }),
    })
  }, [stompClient, movesLength])
  let onResetCounting = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        n: movesLength,
        action: "resetCounting",
      }),
    })
  }, [stompClient, movesLength])
  let onCountingAgree = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        n: movesLength,
        action: "agreeCounting",
      }),
    })
  }, [stompClient, movesLength])
  if (!board.length) {
    return <span>Loading...</span>
  }
  let result = gameHasEnded() ? getScore(board) : undefined
  return (
    <>
      <div className="flex-none grid w-full grid-cols-[min-content_max-content_min-content_auto] gap-x-2">
        <button
          onClick={() => setZoom(zoom - 1)}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: "pl-[4px]",
          }}>
            <FaAngleLeft />
          </IconContext.Provider>
        </button>
        <button onClick={() => setZoom(0)}>
          <span>Zoom: {Math.trunc(zoom)}</span>
        </button>
        <button
          onClick={() => setZoom(zoom + 1)}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: "pr-[4px]",
          }}>
            <FaAngleRight />
          </IconContext.Provider>
        </button>
        <button title="Leave the game" onClick={onExit}
          className="justify-self-end">
          <IconContext.Provider value={{
            size: "1.5em",
            className: "pr-[4px]",
          }}>
            <IoMdExit />
          </IconContext.Provider>
        </button>
      </div>
      <div className="flex-none flex gap-x-1">
        <div>{white}</div>
        <div>vs</div>
        <div>{black}</div>
      </div>
      <div className="flex-none">
        Move {queueLength}
      </div>
      <div className="flex-none">
        <Button
          onClick={onPass}
          className="py-1 px-4"
          disabled={gameHasEnded() || counting || currentPlayer() !== auth.name}>
          Pass
        </Button>
      </div>
      {counting && <>
        <div className="flex-none">
          <Button
            className="py-1 px-4"
            disabled={gameHasEnded()}
            onClick={onResetCounting}>
            Reset Counting
          </Button>
        </div>
        <div className="flex-none">
          <Button
            disabled={(!isSelfPlay && countingAgreed()) || gameHasEnded() || !countingComplete()}
            className="py-1 px-4"
            onClick={onCountingAgree}>
            OK
          </Button>
        </div>
      </>}
      {result && (
        <div className="flex-none">
          {(result.w > result.b ? "W+" : "B+") + Math.abs(result.b - result.w)}
        </div>
      )}
      <GameChat />
    </>
  )
}

function getScore(board) {
  let w = 0, b = 0
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      let { color } = board[y][x]
      if ((color & WHITE) || (color & TERRITORY_W)) {
        w++
      }
      if ((color & BLACK) || (color & TERRITORY_B)) {
        b++
      }
    }
  }
  return { w, b }
}
