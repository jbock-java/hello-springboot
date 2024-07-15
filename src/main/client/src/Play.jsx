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
} from "./util.js"
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
  useAuthStore,
  useGameStore,
} from "./store.js"

const tileClasses = "border border-r border-b border-black w-8 h-8 grid place-items-center"

export const Play = () => {
  let stompClient = useContext(StompContext)
  let symbol = useGameStore(state => state.symbol)
  let auth = useAuthStore(state => state.auth)
  let setGameState = useGameStore(state => state.setGameState)
  let black = useGameStore(state => state.gameState.black)
  let white = useGameStore(state => state.gameState.white)
  let position = useGameStore(state => state.gameState.position)
  let currentUser = useGameStore(state => state.gameState.currentUser)
  let positionRef = useRef()
  positionRef.current = position
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub = stompClient.subscribe("/topic/game", (message) => {
      let r = JSON.parse(message.body)
      setGameState(r)
    })
    return sub.unsubscribe
  }, [setGameState, initialized, stompClient])
  let onClick = useCallback((i) => {
    let updated = [...positionRef.current]
    updated[i] = symbol
    stompClient.publish({
      destination: "/app/move",
      body: JSON.stringify({
        position: updated,
        currentUser: auth.id === black.id ? white.id : black.id,
      }),
    })
  }, [stompClient, auth, symbol, black, white])
  return (
    <div className="mt-2 ml-4">
      <div>{currentUser === auth.id ? "Jetzt bin ich dran" : "Der andere Spieler ist dran..."}</div>
      <div className="border border-l border-t border-black mt-4 inline-grid grid-cols-[min-content_min-content_min-content]">
        {position.map((check, i) => (
          <Tile
            disabled={currentUser !== auth.id}
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
  return (
    <div className={tileClasses}>
      <IconContext.Provider value={{ size: "1.5em" }}>
        {check == "circle" ? <FaRegCircle /> : <ImCross />}
      </IconContext.Provider>
    </div>
  )
}

function TileHover({disabled, onClick}) {
  let symbol = useGameStore(state => state.symbol)
  let classes = twJoin(
    tileClasses,
    "text-white",
    !disabled && "cursor-pointer",
    !disabled && "hover:text-slate-400",
  )
  if (disabled) {
    return <div className={classes} />
  }
  return (
    <div className={classes} onClick={!disabled ? onClick : undefined}>
      <IconContext.Provider value={{ size: "1.5em" }}>
        {symbol === "circle" ?  <FaRegCircle /> : <ImCross />}
      </IconContext.Provider>
    </div>
  )
}
