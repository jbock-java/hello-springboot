import {
  useRef,
  useEffect,
  useContext,
} from "react"
import {
  Form,
} from "./Form.jsx"
import {
  Input,
} from "./Input.jsx"
import {
  useNavigate,
} from "react-router-dom"
import {
  base,
  getRandomString,
  StompContext,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

const channel = getRandomString()

export function Login() {
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let setId = useGameStore(state => state.setId)
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub = stompClient.subscribe("/topic/join/" + channel, (message) => {
      let response = JSON.parse(message.body)
      setId(response.id)
      navigate(base + "/lobby")
    })
    return sub.unsubscribe
  }, [navigate, setId, initialized, stompClient])
  let onSubmit = (d) => {
    stompClient.publish({
      destination: "/app/join",
      body: JSON.stringify({
        ...d,
        channel,
      }),
    })
  }
  return (
    <Form className="m-4" onSubmit={onSubmit}>
      <div>
        <Input name="name" />
      </div>
      <button
        className="mt-2 p-2 border border-black"
        type="submit">
          Join
      </button>
    </Form>
  )
}
