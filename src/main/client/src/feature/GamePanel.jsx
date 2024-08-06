import {
  useCallback,
  useContext,
} from "react"
import {
  useParams,
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
} from "../util.js"
import {
  Button,
} from "../component/Button.jsx"
import {
  useAuthStore,
  useGameStore,
} from "../store.js"

export const GamePanel = ({zoom, setZoom}) => {
  return (
    <div className="fixed top-0 right-0 h-full bg-slate-800 border-l-2 border-slate-700">
      <div className="w-64 pr-3 pt-4 pl-4">
        <Panel zoom={zoom} setZoom={setZoom} />
      </div>
    </div>
  )
}

function Panel({zoom, setZoom}) {
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let black = useGameStore(state => state.black)
  let white = useGameStore(state => state.white)
  let queueLength = useGameStore(state => state.queueLength)
  let counting = useGameStore(state => state.counting)
  let countingComplete = useGameStore(state => state.countingComplete)
  let currentPlayer = useGameStore(state => state.currentPlayer)
  let { board, gameHasEnded } = useGameStore(state => state.gameState)
  let navigate = useNavigate()
  let onExit = useCallback(() => {
    navigate(base + "/lobby")
  }, [navigate])
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        n: queueLength(),
        pass: true,
      }),
    })
  }, [stompClient, gameId, queueLength])
  let onResetCounting = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        n: queueLength(),
        resetCounting: true,
      }),
    })
  }, [stompClient, gameId, queueLength])
  let onCountingAgree = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        n: queueLength(),
        agreeCounting: true,
      }),
    })
  }, [stompClient, gameId, queueLength])
  if (!board.length) {
    return <span>Loading...</span>
  }
  let result = gameHasEnded ? getScore(board) : undefined
  return (
    <>
      <div className="inline-flex gap-x-2">
        <button
          onClick={() => setZoom(zoom - 1)}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: "pl-[4px]",
          }}>
            <FaAngleLeft />
          </IconContext.Provider>
        </button>
        <button onClick={() => {
          if (!zoom) {
            setZoom(-zoom) // force re-render
          } else {
            setZoom(0)
          }
        }}>Zoom: {zoom + 0}</button>
        <button
          onClick={() => setZoom(zoom + 1)}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: "pr-[4px]",
          }}>
            <FaAngleRight />
          </IconContext.Provider>
        </button>
      </div>
      <button title="Leave the game" onClick={onExit}
        className="float-right">
        <IconContext.Provider value={{
          size: "1.5em",
          className: "pr-[4px]",
        }}>
          <IoMdExit />
        </IconContext.Provider>
      </button>
      <div className="flex gap-x-1">
        <div>{white.name}</div>
        <div>vs</div>
        <div>{black.name}</div>
      </div>
      <div>Move {queueLength()}</div>
      <div className="mt-2">
        <Button
          onClick={onPass}
          className="py-1 px-4"
          disabled={gameHasEnded || counting() || currentPlayer() !== auth.name}>
          Pass
        </Button>
      </div>
      {counting() && <>
        <div className="mt-2">
          <Button
            className="py-1 px-4"
            disabled={gameHasEnded}
            onClick={onResetCounting}>
            Reset Counting
          </Button>
        </div>
        <div className="mt-2">
          <Button
            disabled={gameHasEnded || !countingComplete()}
            className="py-1 px-4"
            onClick={onCountingAgree}>
            OK
          </Button>
        </div>
      </>}
      {result && (
        <div className="mt-4">
          <div>
            {"w:" + result.w}
          </div>
          <div className="mt-2">
            {"b:" + result.b}
          </div>
          <div className="mt-2">
            Result: {(result.w > result.b ? "w+" : "b+") + Math.abs(result.b - result.w)}
          </div>
        </div>
      )}
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
