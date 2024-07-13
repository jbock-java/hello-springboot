import {
  useContext,
} from "react"
import {
  useNavigate,
} from "react-router-dom"
import {
  StompContext,
} from "./context.js"
import {
  base,
  tfetch,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

export function Login() {
  let navigate = useNavigate()
  let setInit = useGameStore(state => state.setInit)
  let setId = useGameStore(state => state.setId)
  let stompClient = useContext(StompContext)
  let onClick = async () => {
    stompClient.subscribe("/topic/lobby", (message) => {
      let r = JSON.parse(message.body)
      setInit(r)
    })
    let response = await tfetch("/data/join")
    setId(response.id)
    stompClient.publish({
      destination: "/app/match",
      body: JSON.stringify({
        id: response.id,
      }),
    })
    navigate(base + "/lobby")
  }
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
