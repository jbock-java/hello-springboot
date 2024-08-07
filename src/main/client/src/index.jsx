import ReactDOM from "react-dom/client"
import "./index.css"
import {
  Client,
} from "@stomp/stompjs"
import {
  StompContext,
} from "./util.js"
import {
  RouterProvider,
} from "react-router-dom"
import {
  Router,
} from "./Router.jsx"

const stompClient = new Client({
  brokerURL: "ws://" + location.host + "/app/ws/action"
})

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <StompContext.Provider value={stompClient}>
    <RouterProvider router={Router} />
  </StompContext.Provider>
)
