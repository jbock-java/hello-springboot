import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import {
  useNavigate,
} from "react-router-dom"
import {
  Form,
} from "./component/Form.jsx"
import {
  Input,
} from "./component/Input.jsx"
import {
  Button,
} from "./component/Button.jsx"
import {
  base,
  StompContext,
  tfetch,
  doTry,
} from "./util.js"
import {
  LobbyPanel,
} from "./feature/LobbyPanel.jsx"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

export function Lobby() {
  let [isNewGameOpen, setNewGameOpen] = useState(false)
  let [openGames, setOpenGames] = useState([])
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
    let sub1 = stompClient.subscribe("/topic/lobby/open_games", (message) => {
      let r = JSON.parse(message.body)
      setOpenGames(r.games)
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setInit, auth, initialized, stompClient, navigate])
  let onNewGame = useCallback((d) => doTry(async () => {
    let response = await tfetch("/api/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(d),
    })
    let sub = stompClient.subscribe("/topic/game/" + response.id, (message) => {
      let game = JSON.parse(message.body)
      navigate(base + "/game/" + game.id)
      sub.unsubscribe()
    })
    setNewGameOpen(false)
  }), [auth.token, navigate, stompClient])
  let onAccept = useCallback((game) => doTry(async () => {
    await tfetch("/api/accept", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(game),
    })
    navigate(base + "/game/" + game.id)
  }), [auth, navigate])
  let startEdit = useCallback(() => doTry(async () => {
    let response = await tfetch("/api/start_edit", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dim: 9,
        editMode: true,
      }),
    })
    navigate(base + "/game/" + response.id)
  }), [auth, navigate])
  return (
    <div className="mt-4">
      <div className="ml-2">
        <Button
          onClick={() => startEdit()}>
          Create
        </Button>
      </div>
      {!isNewGameOpen && (
        <div className="inline-flex mt-2 py-2 pr-6">
          <Button className="ml-2"
            onClick={() => setNewGameOpen(!isNewGameOpen)}>
            New Game
          </Button>
        </div>
      )}
      {isNewGameOpen && (
        <Form className="mt-2 inline-flex gap-x-2 bg-slate-400 py-2 pr-6 rounded-r-full" onSubmit={onNewGame}>
          <Button onClick={() => setNewGameOpen(false)} className="ml-2 bg-slate-800 hover:border-slate-800">Cancel</Button>
          <label htmlFor="dim" className="text-black pt-2">Dim:</label>
          <Input id="dim" name="dim" className="w-12" defaultValue="9"/>
          <label htmlFor="handi" className="text-black pt-2">Handi:</label>
          <Input id="handi" name="handicap" className="w-8" defaultValue="0"/>
          <Button type="submit" className="bg-slate-800 hover:border-slate-800">OK</Button>
        </Form>
      )}
      <div className="mt-2 ml-2">
        <div className="float-left pt-1">Open games:</div>
        <div className="float-left ml-4 grid grid-cols-[min-content_min-content]">
          {openGames.map((game) => (
            <div
              onClick={() => onAccept(game)}
              className="contents cursor-pointer *:hover:bg-sky-200 *:hover:text-black *:pr-2 *:py-1"
              key={game.id}>
              <div className="pl-2 rounded-l-lg">{game.user.name}</div>
              <div className="rounded-r-lg">{game.dim}x{game.dim}</div>
            </div>
          ))}
        </div>
      </div>
      <LobbyPanel />
    </div>
  )
}
