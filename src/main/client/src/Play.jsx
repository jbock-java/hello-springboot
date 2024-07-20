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
  WHITE,
} from "./util.js"
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
  let board = useGameStore(state => state.gameState.board)
  let currentPlayer = useGameStore(state => state.gameState.currentPlayer)
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
      sub1.unsubscribe
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
                  disabled={currentPlayer !== auth.name}
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
        <button
          onClick={onPass}
          type="button"
          className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded-lg">
          Pass
        </button>
      </div>
      <div className="mt-2">
      {
        currentPlayer === auth.name ?
          "Jetzt bin ich dran" : 
          (opponent.name + " ist dran...")
      }
      </div>
      </div>
    </div>
  )
}
function GridTile() {
  return <div className={gridTileClasses} />
}

function Tile({check, onClick, disabled}) {
  let color = check === BLACK ? "black" : "white"
  if (!check) {
    return (
      <TileHover disabled={disabled} onClick={onClick} />
    )
  }
  return (
    <div className={tileClasses}>
      <IconContext.Provider value={{ color: color, size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function TileHover({disabled, onClick}) {
  let symbol = useGameStore(state => state.symbol)
  let hovercolor = symbol === BLACK ? "hover:text-asch" : "hover:text-esch"
  let classes = twJoin(
    tileClasses,
    "text-transparent",
    !disabled && "cursor-pointer",
    !disabled && hovercolor,
  )
  if (disabled) {
    return <div className={classes} />
  }
  return (
    <div className={classes} onClick={!disabled ? onClick : undefined}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}
