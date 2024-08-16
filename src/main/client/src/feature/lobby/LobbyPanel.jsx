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
import {
  Chat,
} from "../../component/Chat.jsx"
import {
  SideBar,
} from "../../component/SideBar.jsx"

export const LobbyPanel = () => {
  return (
    <SideBar page="lobby">
      <div className="pr-3 pt-4 pl-2 h-full flex flex-col gap-y-1">
        <Panel />
      </div>
    </SideBar>
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
  return <>
    <div className="flex-none h-12 border border-gray-500 bg-gray-900 rounded-lg p-1 overflow-y-scroll">
      {users.map(user => (
        <div key={user}>
          {user}
        </div>
      ))}
    </div>
    <Chat chatId="Lobby"/>
  </>
}
