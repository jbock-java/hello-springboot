import {
  useNavigate,
} from "react-router-dom"
import {
  base,
  tfetch,
} from "./util.js"
import {
  useGameStore,
} from "./store.js"

export function Login() {
  let navigate = useNavigate()
  let setId = useGameStore(state => state.setId)
  let onClick = async () => {
    let response = await tfetch("/data/join")
    setId(response.id)
    navigate(base + "/lobby")
  }
  return (
    <div className="m-4">
      <button
        className="p-2 border border-black"
        onClick={onClick}
        type="button">
          Join
      </button>
    </div>
  )
}
