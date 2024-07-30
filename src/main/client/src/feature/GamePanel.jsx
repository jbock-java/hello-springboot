import {
  useCallback,
  useContext,
} from "react"
import {
  useParams,
} from "react-router-dom"
import {
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa"
import {
  IconContext,
} from "react-icons"
import {
  StompContext,
  BLACK,
  WHITE,
  TERRITORY_B,
  TERRITORY_W,
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
      <div className="pr-12 pt-8 pl-8">
        <Panel zoom={zoom} setZoom={setZoom} />
      </div>
    </div>
  )
}

function Panel({zoom, setZoom}) {
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let { board, currentPlayer, counting } = useGameStore(state => state.gameState)
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        pass: true,
      }),
    })
  }, [stompClient, gameId])
  let onResetCounting = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        resetCounting: true,
      }),
    })
  }, [stompClient, gameId])
  if (!board.length) {
    return <span>Loading...</span>
  }
  let result = counting ? getScore(board) : undefined
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
        <button onClick={() => setZoom(0)}>Zoom: {zoom}</button>
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
      <div className="mt-2">
        <Button
          onClick={onPass}
          disabled={counting || currentPlayer !== auth.name}>
          Pass
        </Button>
      </div>
      {counting && (
        <div className="mt-2">
          <Button
            onClick={onResetCounting}>
            Reset Counting
          </Button>
        </div>
      )}
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
      {!counting && (
        <div className="mt-2">
          {currentPlayer + " ist dran..."}
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
