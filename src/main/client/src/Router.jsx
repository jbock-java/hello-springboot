import {
  useRef,
  useState,
  useEffect,
  useContext,
} from "react"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom"
import {
  Login,
} from "./Login.jsx"
import {
  Lobby,
} from "./Lobby.jsx"
import {
  Play,
} from "./Play.jsx"
import {
  base,
  StompContext,
} from "./util.js"

export const Router = createBrowserRouter(
  createRoutesFromElements(
  <>
    <Route
      element={<WithConnection />}>
      <Route
        path={base}
        element={<Login />} />
      <Route
        path={base + "/lobby"}
        element={<Lobby />} />
      <Route
        path={base + "/game/:gameId"}
        element={<Play />} />
    </Route>
  </>
  )
)

function WithConnection() {
  let stompClient = useContext(StompContext)
  let [connected, setConnected] = useState(false)
  let location = useLocation()
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    stompClient.onConnect = () => {
      setConnected(true)
    }
    stompClient.connectHeaders = {
      token: "abc123",
    }
    stompClient.activate()
  }, [initialized, stompClient, setConnected])
  if (!initialized.current && location.pathname !== base) {
    return <Navigate to={base} />
  }
  if (!connected) {
    return <div className="m-4">Waiting for STOMP connection...</div>
  }
  return <Outlet />
}
