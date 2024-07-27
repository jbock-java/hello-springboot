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
  Button,
} from "./component/Button.jsx"
import {
  base,
  StompContext,
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
    stompClient.publish({
      destination: "/app/lobby/hello",
      body: JSON.stringify({
      }),
    })
    return () => {
      sub1.unsubscribe()
      sub2.unsubscribe()
    }
  }, [setInit, setMatchRequested, auth, initialized, stompClient, navigate])
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
      <LobbyPanel />
    </div>
  )
}
