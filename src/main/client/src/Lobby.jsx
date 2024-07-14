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
  base,
  StompContext,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

export function Lobby() {
  let [matchRequested, setMatchRequested] = useState(false)
  let [users, setUsers] = useState([])
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let id = useGameStore(state => state.id)
  let initialized = useRef()
  let setInit = useGameStore(state => state.setInit)
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/lobby/gamestart", (message) => {
      let r = JSON.parse(message.body)
      setInit(r)
      navigate(base + "/play")
    })
    let sub2 = stompClient.subscribe("/topic/lobby/users", (message) => {
      let r = JSON.parse(message.body)
      setUsers(r.users)
    })
    let sub3 = stompClient.subscribe("/topic/lobby/gamerequest", (message) => {
      let r = JSON.parse(message.body)
      if (r.id === id) {
        setMatchRequested(true)
      }
    })
    stompClient.publish({
      destination: "/app/lobby/hello",
      body: JSON.stringify({
      }),
    })
    return () => {
      sub1.unsubscribe
      sub2.unsubscribe
      sub3.unsubscribe
    }
  }, [setInit, setUsers, setMatchRequested, id, initialized, stompClient, navigate])
  let matchRequest = useCallback(() => {
    stompClient.publish({
      destination: "/app/lobby/match",
      body: JSON.stringify({
        id,
      }),
    })
  }, [id, stompClient])
  if (!matchRequested) {
    return (
      <div className="m-4">
        <button type="button"
          className="p-2 border border-black"
          disabled={id == null}
          onClick={matchRequest}>
          Find match
        </button>
        <div className="mt-2">
          {users.map(user => (
            <div key={user.id}>{user.name}</div>
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
