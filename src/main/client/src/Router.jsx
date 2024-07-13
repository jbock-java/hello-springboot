import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom"
import {
  Lobby,
} from "./Lobby.jsx"
import {
  base,
} from "./util.js"

export const Router = createBrowserRouter(
  createRoutesFromElements(
  <>
    <Route
      path={base}
      element={<Lobby />} />
  </>
  )
)
