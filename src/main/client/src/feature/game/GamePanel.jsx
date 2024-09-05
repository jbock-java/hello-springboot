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
  BLACK,
  WHITE,
} from "src/util.js"
import {
  Button,
} from "src/component/Button.jsx"
import {
  useAuthStore,
  useTimeoutStore,
} from "src/store.js"
import {
  Chat,
} from "src/component/Chat.jsx"
import {
  SideBar,
} from "src/component/SideBar.jsx"
import {
  BabyStone,
} from "src/component/BabyStone.jsx"
import {
  countingComplete,
  currentPlayer,
  currentColor,
  isKibitz,
  moveBack,
  moveForward,
  countingAgreed,
  gameHasEnded,
  isAtStart,
  isAtEnd,
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
  let auth = useAuthStore(state => state.auth)
  let {counting, board} = gameState

  if (!board.length) {
    return <span>Loading...</span>
  }
  let activePlay = !isKibitz(gameState, auth) && !gameHasEnded(gameState)
  return (
    <>
      <WhoIsWho gameState={gameState} />
      <WarpControls
        gameState={gameState}
        setGameState={setGameState}
        activePlay={activePlay} />
      {activePlay && (counting ? (
        <CountControls gameState={gameState} />
      ) : (
        <PassButton gameState={gameState} />
      ))}
      <Chat className="mt-1" chatId={gameId}/>
    </>
  )
}

function WhoIsWho({gameState}) {
  let {black, white} = gameState
  let timeout = useTimeoutStore(state => state.timeout)
  let color = currentColor(gameState)
  let navigate = useNavigate()
  let onExit = useCallback(() => {
    navigate(base + "/lobby")
  }, [navigate])
  return (
    <div className="flex-none grid grid-cols-[max-content_max-content_max-content_auto_max-content] w-full gap-x-4">
      <div className="flex"><BabyStone color="white" className="pr-1" />{white}</div>
      <div>VS</div>
      <div className="flex"><BabyStone color="black" className="pr-1" />{black}</div>
      <div />
      <button title="Leave the game" onClick={onExit}>
        <IconContext.Provider value={{
          size: "1.5em",
          className: "pr-[4px]",
        }}>
          <IoMdExit />
        </IconContext.Provider>
      </button>
      <div>{color === WHITE ? timeout : "10"}</div>
      <div />
      <div>{color === BLACK ? timeout : "10"}</div>
      <div />
      <div />
    </div>
  )
}

function WarpControls({gameState, setGameState, activePlay}) {
  return (
    <div className="flex-none flex gap-x-1 items-center">
      <Button title="Back"
        disabled={activePlay || isAtStart(gameState)}
        onClick={() => setGameState(moveBack(gameState))}
        className="py-1 px-2">
        Back
      </Button>
      <div className="flex-none">
        <div>Move {gameState.viewPos}</div>
      </div>
      <Button title="Forward"
        disabled={activePlay || isAtEnd(gameState)}
        onClick={() => setGameState(moveForward(gameState))}
        className="py-1 px-2">
        Forward
      </Button>
    </div>
  )
}

function CountControls({gameState}) {
  let stompClient = useContext(StompContext)
  let onResetCounting = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        action: "resetCounting",
      }),
    })
  }, [stompClient])
  let onCountingAgree = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        action: "agreeCounting",
      }),
    })
  }, [stompClient])
  return (
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
  )
}

function PassButton({gameState}) {
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        action: "pass",
      }),
    })
  }, [stompClient])
  return (
    <div className="mt-1 flex-none">
      <Button
        onClick={onPass}
        className="py-1 px-4"
        disabled={currentPlayer(gameState) !== auth.name}>
        Pass
      </Button>
    </div>
  )
}
