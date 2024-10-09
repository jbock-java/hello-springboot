import {
  useRef,
  useState,
  useCallback,
} from "react"
import {
  twJoin,
} from "tailwind-merge"
import {
  useNavigate,
} from "react-router-dom"
import {
  Button,
} from "src/component/Button.jsx"
import {
  base,
  tfetch,
  doTry,
} from "src/util.js"
import {
  useAuthStore,
} from "src/store.js"
import {
  getZindex,
  setOpenGameId,
  closeLobbyPopup,
} from "./lobbyState.js"
import {
  CgClose,
} from "react-icons/cg"
import {
  IconContext,
} from "react-icons"

export function NewGameDialog({lobbyState, setLobbyState, newGameRef}) {
  let zNewGame = getZindex(lobbyState, "newgame")
  let dimRef = useRef(9)
  let timeRef = useRef(10)
  let [edit, setEdit] = useState(false)
  let auth = useAuthStore(state => state.auth)
  let navigate = useNavigate()
  let onNewGame = useCallback((game) => doTry(async () => {
    let response = await tfetch("/api/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(game),
    })
    let newState = closeLobbyPopup(lobbyState)
    setLobbyState(setOpenGameId(newState, response.id))
  }), [auth.token, lobbyState, setLobbyState])
  let onStartEdit = useCallback((game) => doTry(async () => {
    let response = await tfetch("/api/start_edit", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(game),
    })
    navigate(base + "/game/" + response.id)
  }), [auth, navigate])
  return (
    <form onSubmit={(e) => {
        e.preventDefault()
        let game = {dim: dimRef.current, timesetting: timeRef.current}
        if (edit) {
          onStartEdit(game)
        } else {
          onNewGame(game)
        }
      }}>
      <div ref={newGameRef}
        style={{
          zIndex: zNewGame,
        }}
        className={twJoin(
          !zNewGame && "hidden",
          "absolute ml-40 bg-slate-800 border-2 border-slate-600 rounded-lg px-3 py-2",
        )}>
        <div className="absolute top-1 right-1">
          <button onClick={() => setLobbyState(closeLobbyPopup(lobbyState))} className="text-stone-100 hover:text-stone-300">
            <IconContext.Provider value={{ size: "1.25em" }}>
              <CgClose />
            </IconContext.Provider>
          </button>
        </div>
        <div className="mt-1">
          <span className="italic text-gray-400">Board Dimension:</span>
        </div>
        <div className="flex flex-row gap-x-4">
          <div>
            <input id="dim-9" type="radio" name="dim" value="9" defaultChecked={true} onClick={() => dimRef.current = 9} />
            <label htmlFor="dim-9" className="pt-[0.625rem]">9x9</label>
          </div>
          <div>
            <input id="dim-13" type="radio" name="dim" value="13" onClick={() => dimRef.current = 13} />
            <label htmlFor="dim-13" className="pt-[0.625rem]">13x13</label>
          </div>
          <div>
            <input id="dim-19" type="radio" name="dim" value="19" onClick={() => dimRef.current = 19} />
            <label htmlFor="dim-19" className="pt-[0.625rem]">19x19</label>
          </div>
        </div>
        <div className="mt-3">
          <span className="italic text-gray-400">Time Setting:</span>
        </div>
        <div className="flex flex-row gap-x-3">
          <div>
            <input id="time-0" type="radio" name="time" value="0" onClick={() => timeRef.current = 0} />
            <label htmlFor="time-0" className="pt-[0.625rem]" >No time limit</label>
          </div>
          <div>
            <input id="time-10" type="radio" name="time" value="10" defaultChecked={true} onClick={() => timeRef.current = 10} />
            <label htmlFor="time-10" className="pt-[0.625rem]">10s</label>
          </div>
          <div>
            <input id="time-30" type="radio" name="time" value="30" onClick={() => timeRef.current = 30} />
            <label htmlFor="time-30" className="pt-[0.625rem]">30s</label>
          </div>
        </div>
        <div className="flex flex-row w-full mt-3">
          <div className="self-end">
          <input id="cb-edit" type="checkbox" name="edit" checked={edit} onChange={() => setEdit(!edit)} />
          <label htmlFor="cb-edit" className={twJoin(
            !edit && "text-gray-400",
            "pt-[0.625rem] ml-1",
          )}>Edit Mode</label>
          </div>
          <div className="grow" />
          <Button type="submit">OK</Button>
        </div>
      </div>
    </form>
  )
}
