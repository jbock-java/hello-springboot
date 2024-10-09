import {
  useRef,
  useState,
  useEffect,
  useContext,
} from "react"
import {
  twJoin,
} from "tailwind-merge"
import {
  useNavigate,
} from "react-router-dom"
import {
  base,
  StompContext,
  stopPropagation,
} from "src/util.js"
import {
  LobbyPanel,
} from "./LobbyPanel.jsx"
import {
  OpenGames,
} from "./OpenGames.jsx"
import {
  ActiveGames,
} from "./ActiveGames.jsx"
import {
  Requests,
} from "./Requests.jsx"
import {
  NewGameDialog,
} from "./NewGameDialog.jsx"
import {
  useAuthStore,
} from "src/store.js"
import {
  getZindex,
  setNewGameOpen,
  handleLobbyClick,
  initialState,
} from "./lobbyState.js"

const detailData = [
  ["open", "Open Games"],
  ["active", "Active Games"],
  ["requests", "Game Requests"],
]

export function Lobby() {
  let [lobbyState, setLobbyState] = useState(initialState())
  let zNewGame = getZindex(lobbyState, "newgame")
  let [detail, setDetail] = useState("open")
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let newGameRef = useRef()
  let stompClient = useContext(StompContext)
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub = stompClient.subscribe("/topic/gamestart", (message) => {
      let r = JSON.parse(message.body)
      if (r.players.includes(auth.name)) {
        navigate(base + "/game/" + r.id)
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, [auth, initialized, stompClient, navigate])
  return (
    <div onClick={(event) => setLobbyState(handleLobbyClick(lobbyState, event))} className="h-full">
      <div className={twJoin(
          "mt-2 py-2 pr-4",
        )}>
        <NewGameDialog
          lobbyState={lobbyState}
          setLobbyState={setLobbyState}
          newGameRef={newGameRef} />
        <button disabled={zNewGame !== 0}  className={twJoin(
            "ml-2 border-2 border-transparent px-4 py-2 rounded-lg",
            zNewGame && "bg-gray-400",
            !zNewGame && "hover:border-sky-700",
          )}
          onClick={(event) => {
            setLobbyState(setNewGameOpen(lobbyState, newGameRef.current))
            stopPropagation(event)
          }}>
          New Game
        </button>
      </div>
      <div className="mt-2 grid gap-x-4 grid-cols-[max-content_auto]">
        <DetailNavigation detail={detail} setDetail={setDetail} />
        {detail === "open" && (
          <OpenGames lobbyState={lobbyState} setLobbyState={setLobbyState} />
        )}
        {detail === "active" && (
          <ActiveGames />
        )}
        {detail === "requests" && (
          <Requests lobbyState={lobbyState} />
        )}
      </div>
      <LobbyPanel />
    </div>
  )
}

function DetailNavigation({detail, setDetail}) {
  return (
    <div className={twJoin(
      "w-fit py-3 pl-2 pr-3 border-r-2 border-y-2 border-slate-600",
      "rounded-r-xl flex flex-col gap-y-2",
    )}>
      {detailData.map(([id, label]) => (
        <button
          key={id}
          onClick={() => setDetail(id)}
          disabled={id === detail}
          className={twJoin(
            "px-2 py-2 rounded-lg border-2",
            id === detail && "border-slate-600",
            id !== detail && "border-transparent hover:border-sky-700",
          )}>{label}</button>
      ))}
    </div>
  )
}
