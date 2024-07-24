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
  hasBlack,
  hasStone,
  getColorClassName,
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
              row.map((color, x) => (
                <Tile
                  counting={counting}
                  key={y + "_" + x}
                  onClick={() => onClick(x, y)}
                  color={color} />
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

function Tile({ color, onClick, counting }) {
  if (!hasStone(color)) {
    return <EmptyTile onClick={onClick} color={color} />
  }
  if (counting) {
    return (
      <CountingActive color={color} onClick={onClick} />
    )
  }
  return (
    <div className={tileClasses}>
      <IconContext.Provider value={{ color: getColorClassName(color), size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function EmptyTile({ onClick, color }) {
  let { counting, currentPlayer } = useGameStore(state => state.gameState)
  let auth = useAuthStore(state => state.auth)
  let currentColor = useGameStore(state => state.gameState.currentColor)
  if ((color & TERRITORY) !== 0) {
    return (
      <div className={tileClasses}>
        <IconContext.Provider value={{ color: getColorClassName(color), size: "1em" }}>
          <FaCircle />
        </IconContext.Provider>
      </div>
    )
  }
  if (counting || currentPlayer !== auth.name) {
      return <div className={tileClasses} />
  }
  let classes = twJoin(
    tileClasses,
    "cursor-pointer",
    "text-transparent",
    "opacity-25",
    currentColor === BLACK ? "hover:text-black" : "hover:text-white",
  )
  return (
    <div className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function CountingActive({ color, onClick }) {
  let classes = twJoin(
    tileClasses,
    "cursor-pointer",
    hasBlack(color) ? "text-black" : "text-white",
    (color & REMOVED) !== 0 ? "opacity-25" : "hover:opacity-25",
  )
  return (
    <div className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}
