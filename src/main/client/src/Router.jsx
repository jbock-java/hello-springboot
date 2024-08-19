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
  twJoin,
} from "tailwind-merge"
import {
  useAuthStore,
} from "src/store.js"
import {
  Login,
} from "src/Login.jsx"
import {
  Lobby,
} from "src/feature/lobby/Lobby.jsx"
import {
  Game,
} from "src/feature/game/Game.jsx"
import {
  base,
  StompContext,
} from "src/util.js"
import {
  useViewStateStore,
} from "src/layout.js"

export const Router = createBrowserRouter(
  createRoutesFromElements(
  <>
    <Route
      element={<WithConnection />}>
      <Route
        element={<Frame />}>
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

function Frame() {
  let dragging = useViewStateStore(state => state.dragging)
  return <>
    <div className={twJoin(
        "h-full",
        dragging && "cursor-col-resize",
      )}>
      <Outlet />
    </div>
    <Toaster position="top-right" />
  </>
}

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
