import {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react"
import {
  FaCircle,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa"
import {
  IconContext,
} from "react-icons"
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
  useAuthStore,
  useGameStore,
} from "./store.js"

export function Lobby() {
  let [isNewGameOpen, setNewGameOpen] = useState(false)
  let [isStartEditOpen, setStartEditOpen] = useState(false)
  let [openGames, setOpenGames] = useState([])
  let [acceptableGame, setAcceptableGame] = useState(undefined)
  let stompClient = useContext(StompContext)
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let initialized = useRef()
  let setInit = useGameStore(state => state.setInit)
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/lobby/open_games", (message) => {
      let r = JSON.parse(message.body)
      setOpenGames(r.games)
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setInit, auth, initialized, stompClient, navigate])
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
  let onAccept = useCallback((d) => doTry(async () => {
    await tfetch("/api/accept", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + auth.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(d),
    })
    navigate(base + "/game/" + d.game.id)
  }), [auth, navigate])
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
            onClick={() => setStartEditOpen(true)}>
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
            onClick={() => setNewGameOpen(true)}>
            New Game
          </Button>
        )}
      </div>
      <div className="mt-1 ml-2">
        <div className="float-left pt-3">Open games:</div>
        <div className="float-left ml-4 grid grid-cols-[min-content_min-content]">
          {openGames.map((game) => (
            <OpenGame
              game={game}
              acceptableGame={acceptableGame}
              setAcceptableGame={setAcceptableGame}
              key={game.id} />
          ))}
        </div>
        {acceptableGame && (
          <AcceptDialog
            acceptableGame={acceptableGame}
            setAcceptableGame={setAcceptableGame}
            onAccept={onAccept}
          />
        )}
      </div>
      <LobbyPanel />
    </div>
  )
}

function OpenGame({game, acceptableGame, setAcceptableGame}) {
  let dimRef = useRef()
  let auth = useAuthStore(state => state.auth)
  let disabled = auth.name === game.user.name
  let classes = twJoin(
    "contents",
    "*:py-3",
    !disabled && "cursor-pointer *:hover:bg-sky-200 *:hover:text-black",
  )
  let dimClasses = twJoin(
    "pl-1",
    "pr-3",
    "rounded-r-lg",
  )
  return (
    <div
      onClick={disabled ? undefined : () => {
        let rect = dimRef.current.getBoundingClientRect()
        if (acceptableGame?.game.id === game.id) {
          setAcceptableGame(undefined)
        } else {
          setAcceptableGame({
            game: game,
            rect: {
              top: rect.top,
              right: rect.right,
            },
          })
        }
      }}
      className={classes}
      key={game.id}>
      <div className="pl-3 pr-1 rounded-l-lg">{game.user.name}</div>
      <div ref={dimRef} className={dimClasses}>
        {game.dim}x{game.dim}
      </div>
    </div>
  )
}

function AcceptDialog({acceptableGame, onAccept}) {
  let { top, right } = acceptableGame.rect
  let [isFlip, setFlip] = useState(false)
  let [handi, setHandi] = useState(0)
  let auth = useAuthStore(state => state.auth)
  return (
    <Form
      onSubmit={() => onAccept({
        game: acceptableGame.game,
        flip: isFlip,
        handicap: handi,
      })}
      style={{
        position: "absolute",
        top: top,
        left: Math.trunc(right) + 16,
      }}
      className="absolute bg-sky-200 px-4 py-3 rounded-lg z-10 flex flex-col">
      <div className="text-black">
        <button type="button" className="inline-flex" onClick={() => setFlip(!isFlip)}>
          <BabyStone color={isFlip ? "white": "black"} />
          {acceptableGame.game.user.name}
        </button>
      </div>
      <div className="text-black">
        <button type="button" className="inline-flex" onClick={() => setFlip(!isFlip)}>
          <BabyStone color={isFlip ? "black": "white"} />
          {auth.name}
        </button>
      </div>
      <div className="mt-2 text-black py-1">
        <div className="inline-flex">
        <span>Handicap:</span>
        <button type="button" disabled={handi === 0} onClick={() => setHandi(Math.max(0, handi - 1))}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: twJoin(
              "pl-[4px]",
              "pr-[4px]",
              handi === 0 && "text-slate-400",
            )
          }}>
            <FaAngleLeft />
          </IconContext.Provider>
        </button>
        <span className="font-bold">{handi === 0 ? 0 : handi + 1}</span>
        <button type="button" className="" onClick={() => setHandi(handi + 1)}>
          <IconContext.Provider value={{ size: "1.25em", className: "pl-1" }}>
            <FaAngleRight />
          </IconContext.Provider>
        </button>
        </div>
      </div>
      <Button type="submit" className="mt-4 bg-slate-800 hover:border-slate-800">OK</Button>
    </Form>
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

function BabyStone({color}) {
  return (
    <IconContext.Provider value={{ color: color, size: "1.5em", className: "pr-2" }}>
      <FaCircle />
    </IconContext.Provider>
  )
}
