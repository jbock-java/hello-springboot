import ReactDOM from "react-dom/client"
import "src/index.css"
import {
  Client,
} from "@stomp/stompjs"
import {
  StompContext,
} from "src/util.js"
import {
  RouterProvider,
} from "react-router-dom"
import {
  Router,
} from "src/Router.jsx"

const stompClient = new Client({
  brokerURL: "ws://" + location.host + "/app/ws/action"
})

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <StompContext.Provider value={stompClient}>
    <RouterProvider router={Router} />
  </StompContext.Provider>
)
