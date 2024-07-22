import {
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react"
import {
  useParams,
} from "react-router-dom"
import {
  twJoin,
} from "tailwind-merge"
import {
  StompContext,
  BLACK,
  TERRITORY,
  REMOVED,
  hasColor,
  hasBlack,
} from "./util.js"
import {
  Button,
} from "./component/Button.jsx"
import {
  IconContext,
} from "react-icons"
import {
  FaCircle,
} from "react-icons/fa"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

const gridTileClasses = "w-12 h-12 border-r border-b border-asch"
const tileClasses = "w-12 h-12 grid place-items-center"

export const Play = () => {
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let setGameState = useGameStore(state => state.setGameState)
  let black = useGameStore(state => state.black)
  let white = useGameStore(state => state.white)
  let { board, currentPlayer, counting } = useGameStore(state => state.gameState)
  let initialized = useRef()
  let opponent = auth.name === black.name ? white : black
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/game/" + gameId, (message) => {
      let game = JSON.parse(message.body)
      setGameState(game, auth)
    })
    stompClient.publish({
      destination: "/app/game/hello",
      body: JSON.stringify({
        id: gameId,
      }),
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setGameState, initialized, stompClient, auth, gameId])
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        pass: true,
      }),
    })
  }, [stompClient, gameId])
  let onClick = useCallback((x, y) => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        x: x,
        y: y,
      }),
    })
  }, [stompClient, gameId])
  if (!board) {
    return <div>Spieldaten werden geladen...</div>
  }
  return (
    <div className="mt-2 ml-4">
      <div className="relative w-full h-1">
        <div className="absolute bg-kirsch p-6">
          <div className="m-6 inline-grid grid-cols-8 border-l border-t border-asch">
          {
            Array.from({length: (board.length - 1) * (board.length - 1)}).map((_, index) => (
              <GridTile key={index} />
            ))
          }
          </div>
        </div>
        <div className="absolute z-5 left-6 top-6 inline-grid grid-cols-9">
          {
            board.map((row, y) => (
              row.map((check, x) => (
                <Tile
                  disabled={!counting && currentPlayer !== auth.name}
                  counting={counting}
                  key={y + "_" + x}
                  onClick={() => onClick(x, y)}
                  check={check} />
              ))
            ))
          }
        </div>
      </div>
      <div className="fixed right-12 ml-4">
      <div>
        <Button
          onClick={onPass}
          disabled={counting || currentPlayer !== auth.name}>
          Pass
        </Button>
      </div>
      <div className="mt-2">
      {
        counting ? "" : (
        currentPlayer === auth.name ?
          "Jetzt bin ich dran" : 
          (opponent.name + " ist dran...")
        )
      }
      </div>
      </div>
    </div>
  )
}

function GridTile() {
  return <div className={gridTileClasses} />
}

function Tile({check, onClick, disabled, counting}) {
  if (counting && hasColor(check) && (check & TERRITORY) === 0) {
    return (
      <CountingActive check={check} onClick={onClick} />
    )
  }
  if (!hasColor(check) && !counting) {
    if (disabled) {
      return <div className={twJoin(tileClasses, "text-transparent")} />
    }
    return (
      <EmptyActive onClick={onClick} />
    )
  }
  if (!hasColor(check)) {
    return <div className={twJoin(tileClasses, "text-transparent")} />
  }
  return (
    <div className={tileClasses}>
      <IconContext.Provider value={getStyle(check)}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function getStyle(check) {
  let size = (check & TERRITORY) !== 0 ? "1em" : "2.75em"
  if ((check & BLACK) !== 0) {
    return { color: "black", size: size }
  }
  return { color: "white", size: size }
}

function EmptyActive({ onClick }) {
  let currentColor = useGameStore(state => state.gameState.currentColor)
  let hovercolor = currentColor === BLACK ? "hover:text-black" : "hover:text-white"
  let classes = twJoin(
    tileClasses,
    "text-transparent",
    "cursor-pointer opacity-25",
    hovercolor,
  )
  return (
    <div className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function CountingActive({ check, onClick }) {
  let color = hasBlack(check) ? "text-black" : "text-white"
  let classes = twJoin(
    tileClasses,
    "cursor-pointer",
    color,
    (check & REMOVED) !== 0 ? "opacity-25" : "hover:opacity-25",
  )
  return (
    <div className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}
