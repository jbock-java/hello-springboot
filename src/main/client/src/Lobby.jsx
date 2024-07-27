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
      await tfetch("/api/create", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(d),
      })
    } catch (e) {
      toast.error(e.message)
    }
  }, [auth.token])
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
    <div className="m-4">
      <div>
        <Button
          onClick={() => matchRequest(true)}>
          Create
        </Button>
      </div>
      <div className="mt-2">
        <Button
          onClick={() => matchRequest(false)}>
          Find match
        </Button>
      </div>
      <div className="mt-2">
        <Button
          onClick={() => setNewGameOpen(!isNewGameOpen)}>
          New Game
        </Button>
      </div>
      {isNewGameOpen && (
        <Form className="mt-2" onSubmit={onNewGame}>
          <Input name="dim" defaultValue="9"/>
          <Input name="handicap" defaultValue="0"/>
          <Button
            type="submit">
            OK
          </Button>
        </Form>
      )}
      <div className="mt-2">
        {openGames.map((game) => (
          <div key={game.id}>{game.user.name}, {game.dim}x{game.dim}</div>
        ))}
      </div>
      <LobbyPanel />
    </div>
  )
}
