import {
  useCallback,
  useContext,
} from "react"
import {
  useParams,
  useNavigate,
} from "react-router-dom"
import {
  IoMdExit,
} from "react-icons/io"
import {
  IconContext,
} from "react-icons"
import {
  StompContext,
  base,
} from "src/util.js"
import {
  Button,
} from "src/component/Button.jsx"
import {
  useAuthStore,
} from "src/store.js"
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
  isKibitz,
  moveBack,
  moveForward,
  countingAgreed,
  gameHasEnded,
} from "./state.js"

export const GamePanel = ({gameState, setGameState}) => {
  return (
    <SideBar page="game">
      <div className="pr-3 pt-4 pl-2 h-full flex flex-col">
        <Panel gameState={gameState} setGameState={setGameState} />
      </div>
    </SideBar>
  )
}

function Panel({gameState, setGameState}) {
  let {gameId} = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let {black, white, viewPos, counting, board} = gameState
  let movesLength = gameState.moves.length
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
  return (
    <>
      <div className="flex-none flex w-full gap-x-1">
        <div>{white}</div>
        <div>vs</div>
        <div>{black}</div>
        <div className="grow" />
        <button title="Leave the game" onClick={onExit}>
          <IconContext.Provider value={{
            size: "1.5em",
            className: "pr-[4px]",
          }}>
            <IoMdExit />
          </IconContext.Provider>
        </button>
      </div>
      {(gameHasEnded(gameState) || isKibitz(gameState, auth)) ? (
        <div className="flex-none flex gap-x-1 items-center">
          <Button title="Back"
            onClick={() => setGameState(moveBack(gameState))}
            className="py-1 px-2">
            Back
          </Button>
          <div className="flex-none">
            <div>Move {viewPos}</div>
          </div>
          <Button title="Forward"
            onClick={() => setGameState(moveForward(gameState))}
            className="py-1 px-2">
            Forward
          </Button>
        </div>
      ) : (
        <div className="flex-none">
          <div>Move {viewPos}</div>
        </div>
      )}
      {!isKibitz(gameState, auth) && !gameHasEnded(gameState) && (
        <div className="mt-1 flex-none">
          <Button
            onClick={onPass}
            className="py-1 px-4"
            disabled={counting || currentPlayer(gameState) !== auth.name}>
            Pass
          </Button>
        </div>
      )}
      {!isKibitz(gameState, auth) && !gameHasEnded(gameState) && counting && <>
        <div className="mt-1 flex-none flex gap-x-1">
          <Button
            className="py-1 px-4"
            disabled={gameHasEnded(gameState)}
            onClick={onResetCounting}>
            Reset Counting
          </Button>
          <Button
            disabled={countingAgreed(gameState) || !countingComplete(gameState)}
            className="py-1 px-4"
            onClick={onCountingAgree}>
            OK
          </Button>
        </div>
      </>}
      <Chat className="mt-1" chatId={gameId}/>
    </>
  )
}
