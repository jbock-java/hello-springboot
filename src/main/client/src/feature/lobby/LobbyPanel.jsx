import {
  useEffect,
} from "react"
import {
  tfetch,
  doTry,
} from "src/util.js"
import {
  useAuthStore,
} from "src/store.js"
import {
  Chat,
} from "src/component/Chat.jsx"
import {
  SideBar,
} from "src/component/SideBar.jsx"

export const LobbyPanel = () => {
  return (
    <SideBar page="lobby">
      <div className="pr-3 pt-2 pl-2 h-full flex flex-col">
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
    <Chat chatId="Lobby" />
  </>
}
