import {
  useEffect,
} from "react"
import {
  tfetch,
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
      <div className="pr-3 pt-2 pl-2 h-full flex flex-col gap-y-1">
        <Panel />
      </div>
    </SideBar>
  )
}

function Panel() {
  let auth = useAuthStore(state => state.auth)
  useEffect(() => {
    doTry(() => {
      tfetch("/api/lobby/hello", {
        headers: {
          "Authorization": "Bearer " + auth.token,
        },
      })
    })
    return undefined
  }, [auth])
  return <>
    <Chat chatId="Lobby"/>
  </>
}
