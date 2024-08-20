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
} from "src/util.js"
import {
  Button,
} from "src/component/Button.jsx"
import {
  useAuthStore,
} from "src/store.js"
import {
  useViewStateStore,
} from "src/layout.js"
import {
  Chat,
} from "src/component/Chat.jsx"
import {
  SideBar,
} from "src/component/SideBar.jsx"
import {
  countingComplete,
  currentPlayer,
  isSelfPlay,
  countingAgreed,
  gameHasEnded,
} from "./state.js"

export const GamePanel = ({gameState}) => {
  return (
    <SideBar page="game">
      <div className="pr-3 pt-4 pl-2 h-full flex flex-col">
        <Panel gameState={gameState} />
      </div>
    </SideBar>
  )
}

function Panel({gameState}) {
  let {gameId} = useParams()
  let zoom = useViewStateStore(state => state.zoom)
  let setZoom = useViewStateStore(state => state.setZoom)
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let black = gameState.black
  let white = gameState.white
  let queueLength = gameState.queueLength
  let movesLength = gameState.moves.length
  let counting = gameState.counting
  let board = gameState.board
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
  let result = gameHasEnded(gameState) ? getScore(board) : undefined
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
          disabled={gameHasEnded(gameState) || counting || currentPlayer(gameState) !== auth.name}>
          Pass
        </Button>
      </div>
      {counting && <>
        <div className="flex-none">
          <Button
            className="py-1 px-4"
            disabled={gameHasEnded(gameState)}
            onClick={onResetCounting}>
            Reset Counting
          </Button>
        </div>
        <div className="flex-none">
          <Button
            disabled={(!isSelfPlay(gameState) && countingAgreed(gameState)) || gameHasEnded(gameState) || !countingComplete(gameState)}
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
      <Chat className="mt-1" chatId={gameId}/>
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
