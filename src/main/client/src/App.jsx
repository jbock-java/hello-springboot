import {
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react"
import {
  twJoin,
} from "tailwind-merge"
import {
  StompContext,
} from "./context.js"
import {
  IconContext,
} from "react-icons"
import {
  FaRegCircle,
} from "react-icons/fa"
import {
  ImCross,
} from "react-icons/im"
import {
  useGameStore,
} from "./store.js"

export const App = () => {
  let stompClient = useContext(StompContext)
  let symbol = useGameStore(state => state.symbol)
  let myId = useGameStore(state => state.id)
  let setGameState = useGameStore(state => state.setGameState)
  let position = useGameStore(state => state.gameState.position)
  let lastMove = useGameStore(state => state.gameState.lastMove)
  let positionRef = useRef()
  positionRef.current = position
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    stompClient.subscribe("/topic/greetings", (message) => {
      let r = JSON.parse(message.body)
      setGameState(r)
    })
  }, [setGameState, initialized, stompClient])
  let onClick = useCallback((i) => {
    let updated = [...positionRef.current]
    updated[i] = symbol
    stompClient.publish({
      destination: "/app/action",
      body: JSON.stringify({
        intent: "move",
        position: updated,
        id: myId,
      }),
    })
  }, [stompClient, myId, symbol])
  return (
    <div className="mt-2 ml-4">
      <div>{lastMove === myId ? "Der andere Spieler ist dran..." : "Jetzt bin ich dran"}</div>
      <div className="border border-l border-t border-black mt-4 inline-grid grid-cols-[min-content_min-content_min-content]">
        {position.map((check, i) => (
          <Tile
            disabled={lastMove === myId}
            key={i}
            onClick={() => onClick(i)}
            check={check} />
        ))}
      </div>
    </div>
  )
}

function Tile({check, onClick, disabled}) {
  if (!check) {
    return (
      <TileHover disabled={disabled} onClick={onClick} />
    )
  }
  let classes = "border border-r border-b border-black w-8 h-8"
  return (
    <div className={classes}>
    <IconContext.Provider value={{ className: "pl-1 pt-1", size: "1.5em" }}>
      {check == "circle" ? <FaRegCircle /> : <ImCross />}
    </IconContext.Provider>
    </div>
  )
}

function TileHover({disabled, onClick}) {
  let symbol = useGameStore(state => state.symbol)
  let classes = twJoin(
    "border border-r border-b border-black w-8 h-8 text-white",
    !disabled && "cursor-pointer",
    !disabled && "hover:text-slate-400",
  )
  if (disabled) {
    return <div className={classes} />
  }
  return (
    <div className={classes} onClick={!disabled ? onClick : undefined}>
    <IconContext.Provider value={{ className: "pl-1 pt-1", size: "1.5em" }}>
      {symbol === "circle" ?  <FaRegCircle /> : <ImCross />}
    </IconContext.Provider>
    </div>
  )
}
