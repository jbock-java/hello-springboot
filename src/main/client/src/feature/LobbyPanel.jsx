import {
  useContext,
  useRef,
  useEffect,
  useState,
} from "react"
import {
  StompContext,
} from "../util.js"

export const LobbyPanel = () => {
  return (
    <div className="fixed top-0 right-0 w-64 h-full bg-slate-800 border-l-2 border-slate-700">
      <div className="pt-2 pl-4">
        <Panel />
      </div>
    </div>
  )
}

function Panel() {
  let stompClient = useContext(StompContext)
  let [users, setUsers] = useState([])
  let initialized = useRef()
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/lobby/users", (message) => {
      let r = JSON.parse(message.body)
      setUsers(r.users)
    })
    stompClient.publish({
      destination: "/app/lobby/hello",
      body: JSON.stringify({
      }),
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setUsers, initialized, stompClient])
  return (
    <div className="mt-2">
      {users.map(user => (
        <div key={user.name}>{user.name}</div>
      ))}
    </div>
  )
}
