import {
  useEffect,
  useState,
} from "react"

const ws = new WebSocket("ws://" + location.host + "/app/ws/hello")

export const App = () => {
  let [ data, setData ] = useState("")
  useEffect(() => {
    ws.onmessage = (message) => {
      setData(message.data)
    }
    let timer = setInterval(() => {
      ws.send("Hallo")
    }, 2000)
    return () => clearInterval(timer)
  })
  return (
    <div className="mx-2">
      <h1 className="text-xl font-mono">{data}</h1>
    </div>
  )
}
