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
  useAuthStore,
  useGameStore,
} from "./store.js"

export function Lobby() {
  let [matchRequested, setMatchRequested] = useState(false)
  let [users, setUsers] = useState([])
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
    let sub2 = stompClient.subscribe("/topic/lobby/users", (message) => {
      let r = JSON.parse(message.body)
      setUsers(r.users)
    })
    let sub3 = stompClient.subscribe("/topic/lobby/gamerequest", (message) => {
      let r = JSON.parse(message.body)
      if (r.name === auth.name) {
        setMatchRequested(true)
      }
    })
    stompClient.publish({
      destination: "/app/lobby/hello",
      body: JSON.stringify({
        name: auth.name,
      }),
    })
    return () => {
      sub1.unsubscribe()
      sub2.unsubscribe()
      sub3.unsubscribe()
    }
  }, [setInit, setUsers, setMatchRequested, auth, initialized, stompClient, navigate])
  let matchRequest = useCallback((editMode) => {
    stompClient.publish({
      destination: "/app/lobby/match",
      body: JSON.stringify({
        name: auth.name,
        dim: 9,
        editMode: editMode,
      }),
    })
  }, [auth, stompClient])
  if (!matchRequested) {
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
          {users.map(user => (
            <div key={user.name}>{user.name}</div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="m-4">
     Waiting for match...
    </div>
  )
}
