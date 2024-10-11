import {
  useRef,
  useState,
  useEffect,
  useContext,
} from "react"
import {
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
  Form,
} from "src/component/Form.jsx"
import {
  Button,
} from "src/component/Button.jsx"
import {
  BabyStone,
} from "src/component/BabyStone.jsx"
import {
  StompContext,
  tfetch,
  doTry,
  stopPropagation,
} from "src/util.js"
import {
  getZindex,
  getAcceptData,
  closeLobbyPopup,
  setAcceptDialogOpen,
} from "./lobbyState.js"
import {
  useAuthStore,
} from "src/store.js"

export function OpenGames({lobbyState, setLobbyState}) {
  let [openGames, setOpenGames] = useState([])
  let acceptableGame = getAcceptData(lobbyState)
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let initialized = useRef()
  let acceptDialogRef = useRef()
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
  }, [auth, initialized, stompClient])
  return (
    <div>
      <div className="grid grid-cols-[max-content_max-content_max-content]">
        {openGames.map((game) => (
          <OpenGame
            game={game}
            onClick={(event, acceptableGame) => {
              setLobbyState(setAcceptDialogOpen(lobbyState, acceptDialogRef.current, acceptableGame))
              stopPropagation(event)
            }}
            key={game.id} />
        ))}
      </div>
      <ChallengeDialog
        lobbyState={lobbyState}
        setLobbyState={setLobbyState}
        acceptableGame={acceptableGame}
        acceptDialogRef={acceptDialogRef} />
    </div>
  )
}

function OpenGame({game, onClick}) {
  let dimRef = useRef()
  let auth = useAuthStore(state => state.auth)
  let disabled = auth.name === game.user
  return (
    <div
      onClick={disabled ? undefined : (event) => {
        let rect = dimRef.current.getBoundingClientRect()
        onClick(event, {
          game: game,
          rect: {
            top: rect.top,
            right: rect.right,
          },
        })
      }}
      className={twJoin(
        "contents",
        "*:py-3",
        !disabled && "cursor-pointer *:hover:bg-sky-200 *:hover:text-black",
      )}
      key={game.id}>
      <div className="pl-3 pr-1 rounded-l-lg">{game.user}</div>
      <div className="px-1">
        {game.dim}x{game.dim}
      </div>
      <div ref={dimRef} className="pl-1 pr-3 rounded-r-lg">
        {game.timesetting}s
      </div>
    </div>
  )
}

function ChallengeDialog({lobbyState, setLobbyState, acceptableGame, acceptDialogRef}) {
  let [isFlip, setFlip] = useState(false)
  let [handicap, setHandicap] = useState(1)
  let auth = useAuthStore(state => state.auth)
  let zAccept = getZindex(lobbyState, "accept")
  return (
    <Form
      forwardedRef={acceptDialogRef}
      onSubmit={() => doTry(async () => {
        await tfetch("/api/challenge", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + auth.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game: acceptableGame?.game,
            flip: isFlip,
            handicap: handicap === 1 ? 0 : handicap,
          }),
        })
        setLobbyState(closeLobbyPopup(lobbyState))
      })}
      style={{
        zIndex: zAccept,
        top: acceptableGame?.rect.top || 0,
        left: Math.trunc(acceptableGame?.rect.right || 0) + 16,
      }}
      className={twJoin(
        !zAccept && "hidden",
        "absolute bg-sky-200 px-4 py-3 rounded-lg flex flex-col",
      )}>
      <div className="text-black">
        <button type="button" className="inline-flex" onClick={() => setFlip(!isFlip)}>
          <BabyStone color={isFlip ? "white" : "black"} className="pr-2" />
          {acceptableGame?.game.user}
        </button>
      </div>
      <div className="text-black">
        <button type="button" className="inline-flex" onClick={() => setFlip(!isFlip)}>
          <BabyStone color={isFlip ? "black" : "white"} className="pr-2" />
          {auth.name}
        </button>
      </div>
      <div className="mt-2 text-black py-1">
        <div className="inline-flex">
        <span>Handicap:</span>
        <button type="button" disabled={handicap === 1} onClick={() => setHandicap(Math.max(1, handicap - 1))}>
          <IconContext.Provider value={{
            size: "1.25em",
            className: twJoin(
              "px-1",
              handicap === 1 && "text-slate-400",
            )
          }}>
            <FaAngleLeft />
          </IconContext.Provider>
        </button>
        <span className="font-bold">{handicap === 1 ? "0" : handicap}</span>
        <button type="button" className="" onClick={() => setHandicap(handicap + 1)}>
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

