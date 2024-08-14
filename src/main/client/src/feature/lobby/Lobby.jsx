import {
  useRef,
  useState,
  useContext,
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
} from "../../component/Button.jsx"
import {
  base,
  StompContext,
  tfetch,
  doTry,
} from "../../util.js"
import {
  LobbyPanel,
} from "./LobbyPanel.jsx"
import {
  OpenGames,
} from "./OpenGames.jsx"
import {
  ActiveGames,
} from "./ActiveGames.jsx"
import {
  useAuthStore,
} from "../../store.js"
import {
  CgClose,
} from "react-icons/cg"
import {
  IconContext,
} from "react-icons"

const detailData = [
  ["open", "Open Games"],
  ["active", "Active Games"],
]

export function Lobby() {
  let [isNewGameOpen, setNewGameOpen] = useState(false)
  let [detail, setDetail] = useState("open")
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let onNewGame = useCallback((d) => doTry(async () => {
    let response = await tfetch("/api/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(d),
    })
    let sub = stompClient.subscribe("/topic/game/" + response.id, (message) => {
      let game = JSON.parse(message.body)
      navigate(base + "/game/" + game.id)
      sub.unsubscribe()
    })
    setNewGameOpen(false)
  }), [auth.token, navigate, stompClient])
  let onStartEdit = useCallback((d) => doTry(async () => {
    let response = await tfetch("/api/start_edit", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(d),
    })
    navigate(base + "/game/" + response.id)
  }), [auth, navigate])
  return (
    <div>
      <div className={twJoin(
          "mt-2 inline-flex py-2 pr-4 gap-x-1 border-r-2 border-y-2",
          isNewGameOpen && "rounded-r-full border-slate-600",
          !isNewGameOpen && "border-transparent",
        )}>
        {isNewGameOpen ? (
          <NewGameDialog
            onNewGame={onNewGame}
            onStartEdit={onStartEdit}
            setNewGameOpen={setNewGameOpen} />
        ) : (
          <button className={twJoin(
              "ml-2 border-2 border-transparent px-4 py-2 rounded-lg",
              "hover:border-sky-700",
            )}
            onClick={() => {
              setNewGameOpen(true)
            }}>
            New Game
          </button>
        )}
      </div>
      <div className="clear-both" />
      <DetailNavigation detail={detail} setDetail={setDetail} />
      {detail === "open" && (
        <OpenGames />
      )}
      {detail === "active" && (
        <ActiveGames />
      )}
      <LobbyPanel />
    </div>
  )
}

function NewGameDialog({onNewGame, onStartEdit, setNewGameOpen}) {
  let dimRef = useRef(9)
  let [edit, setEdit] = useState(false)
  return (
    <form className="contents" onSubmit={(e) => {
        e.preventDefault()
        let game = {dim: dimRef.current}
        if (edit) {
          onStartEdit(game)
        } else {
          onNewGame(game)
        }
      }}>
      <Button type="submit" className="ml-2">OK</Button>
      <input id="dim-9" type="radio" name="dim" value="9" className="ml-2" defaultChecked={true} onClick={() => dimRef.current = 9} />
      <label htmlFor="dim-9" className="pt-[0.625rem] pr-1" >9x9</label>
      <input id="dim-13" type="radio" name="dim" value="13" onClick={() => dimRef.current = 13} />
      <label htmlFor="dim-13" className="pt-[0.625rem] pr-1">13x13</label>
      <input id="dim-19" type="radio" name="dim" value="19" onClick={() => dimRef.current = 19} />
      <label htmlFor="dim-19" className="pt-[0.625rem] pr-1">19x19</label>
      <input id="cb-edit" type="checkbox" name="edit" checked={edit} onChange={() => setEdit(!edit)} />
      <label htmlFor="cb-edit" className="pt-[0.625rem] ml-1">Edit</label>
      <button onClick={() => setNewGameOpen(false)} className="ml-1 text-stone-100 hover:text-stone-300">
        <IconContext.Provider value={{ size: "1.25em" }}>
          <CgClose />
        </IconContext.Provider>
      </button>
    </form>
  )
}
function DetailNavigation({detail, setDetail}) {
  return (
    <div className="mt-2">
      <div className={twJoin(
        "float-left py-3 pl-2 pr-3 border-r-2 border-y-2 border-slate-600",
        "rounded-r-xl flex flex-col gap-y-2",
      )}>
      {detailData.map(([id, label]) => (
        <button
          key={id}
          onClick={() => setDetail(id)}
          disabled={id === detail}
          className={twJoin(
            "px-2 py-2 rounded-lg border-2 hover:border-sky-700",
            id === detail && "border-slate-600",
            id !== detail && "border-transparent hover:bg-stone-800",
          )}>{label}</button>
      ))}
      </div>
    </div>
  )
}
