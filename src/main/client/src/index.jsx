import ReactDOM from "react-dom/client"
import "./index.css"
import {
  Client,
} from "@stomp/stompjs"
import {
  StompContext,
} from "./context.js"
import {
  Lobby,
} from "./Lobby.jsx"

const stompClient = new Client({
  brokerURL: "ws://" + location.host + "/app/ws/action"
})

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <StompContext.Provider value={stompClient}>
    <Lobby />
  </StompContext.Provider>
)
