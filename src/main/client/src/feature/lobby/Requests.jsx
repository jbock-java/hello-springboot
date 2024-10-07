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
  useNavigate,
} from "react-router-dom"
import {
  base,
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
  let navigate = useNavigate()
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
      setRequests(r.requests.filter(request => request.gameId === openGameId))
    })
    let sub1 = stompClient.subscribe("/topic/lobby/requests", (message) => {
      let r = JSON.parse(message.body)
      setRequests(r.requests.filter(request => request.gameId === openGameId))
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [auth, initialized, stompClient, navigate, openGameId])
  if (!openGameId) {
    return <div />
  }
  return (
    <div>
      <div className="grid grid-cols-[max-content_max-content_max-content_max-content]">
        {requests.map((request) => (
          <Request
            lobbyState={lobbyState}
            request={request}
            key={request.id} />
        ))}
      </div>
    </div>
  )
}

function Request({lobbyState, request}) {
  let navigate = useNavigate()
  let auth = useAuthStore(state => state.auth)
  let openGameId = lobbyState.openGameId
  let classes = twJoin(
    "contents",
    "*:py-3",
    "cursor-pointer *:hover:bg-sky-200 *:hover:text-black",
  )
  return (
    <div
      onClick={() => {
        doTry(async () => {
          let r = await tfetch("/api/lobby/start", {
            headers: {
              "method": "POST",
              "Authorization": "Bearer " + auth.token,
            },
            body: JSON.stringify({
              gameId: openGameId,
              request: request.id,
            }),
          })
          navigate(base + "/game/" + r.id)
        })
      }}
      className={classes}
      key={request.id}>
      <div className="pl-3 pr-1 rounded-l-lg">
        {request.white}
      </div>
      <div className="px-1">
        {request.black}
      </div>
      <div className="px-1">
        {request.dim}x{request.dim}
      </div>
      <div className="pl-1 pr-3 rounded-r-lg">
        H{request.handi}
      </div>
    </div>
  )
}
