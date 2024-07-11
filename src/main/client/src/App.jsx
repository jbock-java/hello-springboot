import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import {
  Client,
} from "@stomp/stompjs"

const stompClient = new Client({
  brokerURL: "ws://" + location.host + "/app/ws/hello"
})

export const App = () => {
  let [ data, setData ] = useState([])
  let initialized = useRef()
  let dataRef = useRef()
  dataRef.current = data
  let inputRef = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/greetings", (message) => {
        let d = [JSON.parse(message.body).content, ...dataRef.current]
        setData(d)
      })
    }
    stompClient.activate()
  }, [data, setData, initialized])
  let publish = useCallback((d) => {
    stompClient.publish({
      destination: "/app/hello",
      body: JSON.stringify(d),
    })
  }, [])
  return (
    <div className="m-2">
      <form onSubmit={e => {
        e.preventDefault()
        let formData = new FormData(e.currentTarget)
        let d = Object.fromEntries(formData)
        inputRef.current.value = ""
        publish(d)
      }}>
        <div>
          <input className="border-black border p-1" ref={inputRef} name="name" type="text"></input>
        </div>
        <div>
          <button className="border-black border mt-2 px-2 py-1" type="submit">OK</button>
        </div>
      </form>
      <div className="mt-2">
        {data.map((d, i) => (
          <div key={i} className="font-mono">{d}</div>
        ))}
      </div>
    </div>
  )
}
