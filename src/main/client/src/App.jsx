import {
  useEffect,
  useState,
} from "react"
import {
  Client,
} from "@stomp/stompjs"

const stompClient = new Client({
  brokerURL: "ws://" + location.host + "/app/ws/hello"
})

export const App = () => {
  let [ data, setData ] = useState("")
  useEffect(() => {
    stompClient.activate()
    setTimeout(() => {
      stompClient.subscribe("/topic/greetings", (message) => {
        setData(JSON.parse(message.body).content)
      })
    }, 1000)
  }, [])
  useEffect(() => {
    let timer = setInterval(() => {
      stompClient.publish({
        destination: "/app/hello",
        body: JSON.stringify({"name": ""}),
      })
    }, 2000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="mx-2">
      <h1 className="text-xl font-mono">{data}</h1>
    </div>
  )
}
