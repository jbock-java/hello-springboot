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
} from "src/component/Button.jsx"
import {
  base,
  StompContext,
  tfetch,
  doTry,
} from "src/util.js"
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
  useLobbyStore,
} from "src/store.js"
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
  let isNewGameOpen = useLobbyStore(state => state.isNewGameOpen())
  let setNewGameOpen = useLobbyStore(state => state.setNewGameOpen)
  let handleLobbyClick = useLobbyStore(state => state.handleLobbyClick)
  let closeLobbyPopup = useLobbyStore(state => state.closeLobbyPopup)
  let [detail, setDetail] = useState("open")
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let newGameRef = useRef()
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
    closeLobbyPopup()
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
    <div onClick={handleLobbyClick} className="h-full">
      <div className={twJoin(
          "mt-2 py-2 pr-4 gap-x-1",
          isNewGameOpen && "",
          !isNewGameOpen && "border-transparent",
        )}>
        <NewGameDialog
          newGameRef={newGameRef}
          onNewGame={onNewGame}
          onStartEdit={onStartEdit} />
          <button disabled={isNewGameOpen}  className={isNewGameOpen ? twJoin(
              "ml-2 border-2 bg-gray-400 border-transparent px-4 py-2 rounded-lg",
            ) : twJoin(
              "ml-2 border-2 border-transparent px-4 py-2 rounded-lg",
              "hover:border-sky-700",
            )}
            onClick={(event) => {
              setNewGameOpen(newGameRef.current)
              if (event.stopPropagation) {
                event.stopPropagation()
              } else {
                event.cancelBubble = true
              }
            }}>
            New Game
          </button>

      </div>
      <div className="mt-2 grid gap-x-4 grid-cols-[max-content_auto]">
        <DetailNavigation detail={detail} setDetail={setDetail} />
        {detail === "open" && (
          <OpenGames />
        )}
        {detail === "active" && (
          <ActiveGames />
        )}
      </div>
      <LobbyPanel />
    </div>
  )
}

function NewGameDialog({onNewGame, onStartEdit, newGameRef}) {
  let dimRef = useRef(9)
  let timeRef = useRef(10)
  let [edit, setEdit] = useState(false)
  let closeLobbyPopup = useLobbyStore(state => state.closeLobbyPopup)
  let isNewGameOpen = useLobbyStore(state => state.isNewGameOpen())
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
        className={twJoin(
          !isNewGameOpen && "hidden",
          "absolute ml-40 bg-slate-800 border-2 border-slate-600 rounded-lg z-10 px-3 py-2",
          )}>
        <div className="absolute top-1 right-1">
          <button onClick={closeLobbyPopup} className="text-stone-100 hover:text-stone-300">
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
function DetailNavigation({detail, setDetail}) {
  return (
    <div className={twJoin(
      "w-fit py-3 pl-2 pr-3 border-r-2 border-y-2 border-slate-600",
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
  )
}
