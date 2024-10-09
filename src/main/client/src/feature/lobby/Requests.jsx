import {
  useRef,
  useState,
  useEffect,
  useContext,
} from "react"
import {
  twJoin,
} from "tailwind-merge"
import {
  StompContext,
  tfetch,
  doTry,
} from "src/util.js"
import {
  useAuthStore,
} from "src/store.js"

export function Requests({lobbyState}) {
  let [requests, setRequests] = useState([])
  let openGameId = lobbyState.openGameId
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    doTry(async () => {
      let r = await tfetch("/api/lobby/requests", {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
      setRequests(r.requests)
    })
    let sub1 = stompClient.subscribe("/topic/lobby/requests", (message) => {
      let r = JSON.parse(message.body)
      setRequests(r.requests.filter(request => request.gameId === openGameId))
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [auth, initialized, stompClient, openGameId])
  if (!openGameId) {
    return <div />
  }
  return (
    <div>
      <div className="grid grid-cols-[max-content_max-content_max-content_max-content_max-content]">
        {requests.map((request) => (
          <Request
            request={request}
            key={request.opponent} />
        ))}
      </div>
    </div>
  )
}

function Request({request}) {
  let auth = useAuthStore(state => state.auth)
  return (
    <div
      onClick={() => {
        doTry(async () => {
          await tfetch("/api/lobby/start", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + auth.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          })
        })
      }}
      className={twJoin(
        "contents",
        "*:py-3",
        "cursor-pointer *:hover:bg-sky-200 *:hover:text-black",
      )} >
      <div className="pl-3 pr-1 rounded-l-lg">
        {request.flip ? "B" : "W"}: {request.opponent}
      </div>
      <div className="px-1">
        {request.flip ? "W" : "B"}: {request.game.user}
      </div>
      <div className="px-1">
        {request.game.dim}x{request.game.dim}
      </div>
      <div className="px-1">
        T: {request.game.timesetting}
      </div>
      <div className="pl-1 pr-3 rounded-r-lg">
        H: {request.handicap}
      </div>
    </div>
  )
}
