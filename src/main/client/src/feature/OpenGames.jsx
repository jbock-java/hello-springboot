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
} from "../component/Form.jsx"
import {
  Button,
} from "../component/Button.jsx"
import {
  base,
  StompContext,
  tfetch,
  doTry,
} from "../util.js"
import {
  useAuthStore,
  useGameStore,
} from "../store.js"

export function OpenGames() {
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
    doTry(async () => {
      let r = await tfetch("/api/lobby/open_games", {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
      setOpenGames(r.games)
    })
    let sub1 = stompClient.subscribe("/topic/lobby/open_games", (message) => {
      let r = JSON.parse(message.body)
      setOpenGames(r.games)
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setInit, auth, initialized, stompClient, navigate])
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
  return (
    <>
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
    </>
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

function BabyStone({color}) {
  return (
    <IconContext.Provider value={{ color: color, size: "1.5em", className: "pr-2" }}>
      <FaCircle />
    </IconContext.Provider>
  )
}
