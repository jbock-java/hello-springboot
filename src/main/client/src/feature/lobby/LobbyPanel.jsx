import {
  useContext,
  useEffect,
  useState,
} from "react"
import {
  tfetch,
  StompContext,
  doTry,
} from "../../util.js"
import {
  useAuthStore,
} from "../../store.js"

export const LobbyPanel = () => {
  return (
    <div className="fixed top-0 right-0 w-[24rem] h-full bg-slate-800 border-l-2 border-slate-700">
      <div className="pt-2">
        <Panel />
      </div>
    </div>
  )
}

function Panel() {
  let auth = useAuthStore(state => state.auth)
  let stompClient = useContext(StompContext)
  let [users, setUsers] = useState([])
  useEffect(() => {
    doTry(() => {
      tfetch("/api/lobby/hello", {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
    })
    return undefined
  }, [setUsers, auth])
  useEffect(() => {
    let sub1 = stompClient.subscribe("/topic/lobby/users", (message) => {
      let r = JSON.parse(message.body)
      setUsers(r.users)
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setUsers, stompClient])
  return (
    <div className="mt-2">
      <div className="pl-2 pb-2 border-b border-b-slate-700">
        {auth.name}
      </div>
      <div className="pl-2 mt-2">
        {users.map(user => (
          <div key={user}>
            {user}
          </div>
        ))}
      </div>
    </div>
  )
}
