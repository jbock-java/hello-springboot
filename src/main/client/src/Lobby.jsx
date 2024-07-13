import {
  useEffect,
  useContext,
  useRef,
} from "react"
import {
  StompContext,
} from "./context.js"
import {
  App,
} from "./App.jsx"
import {
  tfetch,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

export function Lobby() {
  let status = useGameStore(state => state.status)
  let symbol = useGameStore(state => state.symbol)
  let setInit = useGameStore(state => state.setInit)
  let setId = useGameStore(state => state.setId)
  let stompClient = useContext(StompContext)
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/lobby", (message) => {
        let r = JSON.parse(message.body)
        setInit(r)
      })
    }
    stompClient.activate()
  }, [status, initialized, stompClient, setInit])
  let onClick = async () => {
    let response = await tfetch("/data/join")
    setId(response.id)
    stompClient.publish({
      destination: "/app/match",
      body: JSON.stringify({
        id: response.id,
      }),
    })
  }
  if (!symbol) {
    return (
      <div className="m-4">
        <button
          className="p-2 border border-black"
          onClick={onClick}
          type="button">
            Join
        </button>
      </div>
    )
  }
  if (status === "waiting") {
    return (
      <div className="m-2">
       Warte auf Mitspieler...
      </div>
    )
  }
  return <App />
}
