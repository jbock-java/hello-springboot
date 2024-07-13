import {
  Navigate,
} from "react-router-dom"
import {
  base,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

export function Lobby() {
  let status = useGameStore(state => state.status)
  if (status === "waiting") {
    return (
      <div className="m-2">
       Warte auf Mitspieler...
      </div>
    )
  }
  return <Navigate to={base + "/play"} />
}
