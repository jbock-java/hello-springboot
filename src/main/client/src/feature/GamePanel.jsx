import {
  useCallback,
  useContext,
} from "react"
import {
  useParams,
} from "react-router-dom"
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

export const GamePanel = () => {
  return (
    <div className="fixed top-0 right-0 h-full bg-slate-800 border-l-2 border-slate-700">
      <div className="pr-12 pt-8 pl-8">
        <Panel />
      </div>
    </div>
  )
}

function Panel() {
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
      <div>
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
        <div className="mt-4 font-mono">
          <div>
            {"w:" + result.w}
          </div>
          <div className="mt-2">
            {"b:" + result.b}
          </div>
          <div className="mt-2">
            {(result.w > result.b ? "w+" : "b+") + Math.abs(result.b - result.w)}
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
