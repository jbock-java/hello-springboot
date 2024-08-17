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
  tfetch,
  doTry,
} from "src/util.js"
import {
  useAuthStore,
  useGameStore,
} from "src/store.js"

export function ActiveGames() {
  let [activeGames, setActiveGames] = useState([])
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let initialized = useRef()
  let setInit = useGameStore(state => state.setInit)
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    doTry(async () => {
      let r = await tfetch("/api/lobby/active_games", {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
      setActiveGames(r.games)
    })
    let sub1 = stompClient.subscribe("/topic/lobby/active_games", (message) => {
      let r = JSON.parse(message.body)
      setActiveGames(r.games)
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setInit, auth, initialized, stompClient, navigate])
  return (
    <div>
      <div className="grid grid-cols-[max-content_max-content_max-content]">
        {activeGames.map((game) => (
          <ActiveGame
            game={game}
            key={game.id} />
        ))}
      </div>
    </div>
  )
}

function ActiveGame({game}) {
  let navigate = useNavigate()
  let classes = twJoin(
    "contents",
    "*:py-3",
    "cursor-pointer *:hover:bg-sky-200 *:hover:text-black",
  )
  let dimClasses = twJoin(
    "pl-1",
    "pr-3",
    "rounded-r-lg",
  )
  return (
    <div
      onClick={() => {
        navigate(base + "/game/" + game.id)
      }}
      className={classes}
      key={game.id}>
      <div className="pl-3 pr-1 rounded-l-lg">{game.white}</div>
      <div className="">{game.black}</div>
      <div className={dimClasses}>
        {game.dim}x{game.dim}
      </div>
    </div>
  )
}
