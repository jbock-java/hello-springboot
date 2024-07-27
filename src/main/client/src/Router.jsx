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
} from "react-router-dom"
import {
  Toaster,
} from "react-hot-toast"
import {
  useAuthStore,
} from "./store.js"
import {
  Login,
} from "./Login.jsx"
import {
  Lobby,
} from "./Lobby.jsx"
import {
  Game,
} from "./Game.jsx"
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
        element={
          <div>
            <Outlet />
            <Toaster position="top-right" />
          </div>}>
        <Route
          path={base + "/lobby"}
          element={<Lobby />} />
        <Route
          path={base + "/game/:gameId"}
          element={<Game />} />
      </Route>
    </Route>
    <Route
      path={base + "/login"}
      element={<Login />} />
    <Route
      path={base}
      element={<Login />} />
  </>
  )
)

function WithConnection() {
  let auth = useAuthStore(state => state.auth)
  let stompClient = useContext(StompContext)
  let [connected, setConnected] = useState(false)
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    if (!auth.name) {
      return
    }
    initialized.current = true
    stompClient.onConnect = () => {
      setConnected(true)
    }
    stompClient.connectHeaders = {
      token: auth.token,
    }
    stompClient.activate()
  }, [initialized, stompClient, setConnected, auth])
  if (auth.state == "anonymous") {
    return <Navigate to={base + "/login"} />
  }
  if (auth.state == "pending") {
    return <div className="m-4">Authentication in progress...</div>
  }
  if (!connected) {
    return <div className="m-4">Waiting for STOMP connection...</div>
  }
  return <Outlet />
}
