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
  Form,
} from "./component/Form.jsx"
import {
  Button,
} from "./component/Button.jsx"
import {
  base,
  StompContext,
  tfetch,
  doTry,
} from "./util.js"
import {
  LobbyPanel,
} from "./feature/LobbyPanel.jsx"
import {
  OpenGames,
} from "./feature/OpenGames.jsx"
import {
  useAuthStore,
} from "./store.js"

export function Lobby() {
  let [isNewGameOpen, setNewGameOpen] = useState(false)
  let [isStartEditOpen, setStartEditOpen] = useState(false)
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
    <div className="mt-4">
      <div className={twJoin(
          "inline-flex py-2 pr-6 gap-x-1",
          isStartEditOpen && "rounded-r-full bg-slate-400",
        )}>
        {isStartEditOpen ? (
          <StartEditDialog onStartEdit={onStartEdit} setStartEditOpen={setStartEditOpen} />
        ) : (
          <Button className="ml-2"
            onClick={() => {
              setStartEditOpen(true)
              setNewGameOpen(false)
            }}>
            Editor
          </Button>
        )}
      </div>
      <div className="clear-both" />
      <div className={twJoin(
          "mt-2 inline-flex py-2 pr-6 gap-x-1",
          isNewGameOpen && "rounded-r-full bg-slate-400",
        )}>
        {isNewGameOpen ? (
          <NewGameDialog onNewGame={onNewGame} setNewGameOpen={setNewGameOpen} />
        ) : (
          <Button className="ml-2"
            onClick={() => {
              setStartEditOpen(false)
              setNewGameOpen(true)
            }}>
            New Game
          </Button>
        )}
      </div>
      <OpenGames />
      <LobbyPanel />
    </div>
  )
}

function NewGameDialog({onNewGame, setNewGameOpen}) {
  let dimRef = useRef(9)
  return (
    <Form className="contents" onSubmit={() => onNewGame({dim: dimRef.current})}>
      <Button onClick={() => setNewGameOpen(false)} className="ml-2 bg-slate-800 hover:border-slate-800">Cancel</Button>
      <input id="dim-9" type="radio" name="dim" value="9" className="ml-2" defaultChecked={true} onClick={() => dimRef.current = 9} />
      <label htmlFor="dim-9" className="text-black pt-[0.625rem] pr-1" onClick={() => dimRef.current = 9}>9x9</label>
      <input id="dim-13" type="radio" name="dim" value="13" onClick={() => dimRef.current = 13} />
      <label htmlFor="dim-13" className="text-black pt-[0.625rem] pr-1" onClick={() => dimRef.current = 13}>13x13</label>
      <input id="dim-19" type="radio" name="dim" value="19" onClick={() => dimRef.current = 19} />
      <label htmlFor="dim-19" className="text-black pt-[0.625rem] mr-2" onClick={() => dimRef.current = 19}>19x19</label>
      <Button type="submit" className="bg-slate-800 hover:border-slate-800">OK</Button>
    </Form>
  )
}

function StartEditDialog({onStartEdit, setStartEditOpen}) {
  let dimRef = useRef(9)
  return (
    <Form className="contents" onSubmit={() => onStartEdit({dim: dimRef.current, editMode: true})}>
      <Button onClick={() => setStartEditOpen(false)} className="ml-2 bg-slate-800 hover:border-slate-800">Cancel</Button>
      <input id="dim-9" type="radio" name="dim" value="9" className="ml-2" defaultChecked={true} onClick={() => dimRef.current = 9} />
      <label htmlFor="dim-9" className="text-black pt-[0.625rem] pr-1" onClick={() => dimRef.current = 9}>9x9</label>
      <input id="dim-13" type="radio" name="dim" value="13" onClick={() => dimRef.current = 13} />
      <label htmlFor="dim-13" className="text-black pt-[0.625rem] pr-1" onClick={() => dimRef.current = 13}>13x13</label>
      <input id="dim-19" type="radio" name="dim" value="19" onClick={() => dimRef.current = 19} />
      <label htmlFor="dim-19" className="text-black pt-[0.625rem] mr-2" onClick={() => dimRef.current = 19}>19x19</label>
      <Button type="submit" className="bg-slate-800 hover:border-slate-800">OK</Button>
    </Form>
  )
}
