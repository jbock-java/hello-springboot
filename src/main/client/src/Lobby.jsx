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
import toast from "react-hot-toast"
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
} from "./util.js"
import {
  LobbyPanel,
} from "./feature/LobbyPanel.jsx"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

export function Lobby() {
  let [matchRequested, setMatchRequested] = useState(false)
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
    let sub1 = stompClient.subscribe("/topic/lobby/gamestart", (message) => {
      let game = JSON.parse(message.body)
      navigate(base + "/game/" + game.id)
    })
    let sub2 = stompClient.subscribe("/topic/lobby/gamerequest", (message) => {
      let r = JSON.parse(message.body)
      if (r.name === auth.name) {
        setMatchRequested(true)
      }
    })
    let sub3 = stompClient.subscribe("/topic/lobby/open", (message) => {
      let r = JSON.parse(message.body)
      setOpenGames(r.games)
    })
    stompClient.publish({
      destination: "/app/lobby/hello",
      body: JSON.stringify({
      }),
    })
    return () => {
      sub1.unsubscribe()
      sub2.unsubscribe()
      sub3.unsubscribe()
    }
  }, [setInit, setMatchRequested, auth, initialized, stompClient, navigate])
  let onNewGame = useCallback(async (d) => {
    try {
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
    } catch (e) {
      toast.error(e.message)
    }
  }, [auth.token, navigate, stompClient])
  let onAccept = useCallback(async (game) => {
    try {
      await tfetch("/api/accept", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(game),
      })
      navigate(base + "/game/" + game.id)
    } catch (e) {
      toast.error(e.message)
    }
  }, [auth, navigate])
  let matchRequest = useCallback((editMode) => {
    stompClient.publish({
      destination: "/app/lobby/match",
      body: JSON.stringify({
        dim: 9,
        editMode: editMode,
      }),
    })
  }, [stompClient])
  if (matchRequested) {
    return (
      <div className="m-4">
        Waiting for match...
      </div>
    )
  }
  return (
    <div className="mt-4">
      <div className="ml-2">
        <Button
          onClick={() => matchRequest(true)}>
          Create
        </Button>
      </div>
      <div className="mt-2 ml-2">
        <Button
          onClick={() => matchRequest(false)}>
          Find match
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
