import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import {
  Navigate,
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
  let stompClient = useContext(StompContext)
  let lastMove = useGameStore(state => state.gameState.lastMove)
  let id = useGameStore(state => state.id)
  let initialized = useRef()
  let setInit = useGameStore(state => state.setInit)
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub = stompClient.subscribe("/topic/lobby", (message) => {
      let r = JSON.parse(message.body)
      setInit(r)
    })
    return sub.unsubscribe
  }, [setInit, id, initialized, stompClient])
  let matchRequest = useCallback(() => {
    stompClient.publish({
      destination: "/app/match",
      body: JSON.stringify({
        id,
      }),
    })
    setMatchRequested(true)
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
      </div>
    )
  }
  if (lastMove == null) {
    return (
      <div className="m-4">
       Waiting for match...
      </div>
    )
  }
  return <Navigate to={base + "/play"} />
}
